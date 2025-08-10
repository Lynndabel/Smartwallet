// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./UserRegistry.sol";

/**
 * @title SmartWallet
 * @dev Smart contract wallet with phone number/username payment capabilities
 */
contract SmartWallet is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event PaymentSent(address indexed from, address indexed to, uint256 amount, string identifier);
    event PaymentReceived(address indexed from, address indexed to, uint256 amount);
    event TokenPaymentSent(address indexed from, address indexed to, address indexed token, uint256 amount, string identifier);
    event TokenPaymentReceived(address indexed from, address indexed to, address indexed token, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event TokenDeposit(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawal(address indexed user, address indexed token, uint256 amount);

    // State variables
    address public owner;
    UserRegistry public userRegistry;
    
    // Wallet balances
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public tokenBalances; // user => token => balance
    // Optional per-transfer fee in basis points (e.g., 100 = 1%) and recipient
    uint256 public feeBps;
    address public feeRecipient;
    
    // Payment history
    struct Payment {
        address from;
        address to;
        uint256 amount;
        address token; // address(0) for ETH
        string identifier;
        uint256 timestamp;
    }
    
    mapping(address => Payment[]) public sentPayments;
    mapping(address => Payment[]) public receivedPayments;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }

    constructor(address _userRegistry) {
        owner = msg.sender;
        userRegistry = UserRegistry(_userRegistry);
        feeRecipient = msg.sender;
    }

    /**
     * @dev Transfer contract ownership to a new owner (only current owner)
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }

    /**
     * @dev Deposit ETH to wallet
     */
    function deposit() external payable validAmount(msg.value) {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Deposit ERC20 tokens to wallet
     * @param token Token contract address
     * @param amount Amount to deposit
     */
    function depositToken(address token, uint256 amount) external validAmount(amount) nonReentrant {
        require(token != address(0), "Invalid token address");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
        
        emit TokenDeposit(msg.sender, token, amount);
    }

    /**
     * @dev Withdraw ETH from wallet
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external validAmount(amount) nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Withdraw ERC20 tokens from wallet
     * @param token Token contract address
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external validAmount(amount) nonReentrant {
        require(token != address(0), "Invalid token address");
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        
        tokenBalances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit TokenWithdrawal(msg.sender, token, amount);
    }

    /**
     * @dev Send ETH payment using phone number or username
     * @param identifier Phone number or username of recipient
     * @param amount Amount to send
     */
    function sendPayment(string memory identifier, uint256 amount) 
        external 
        validAmount(amount) 
        nonReentrant 
    {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        address recipient = userRegistry.getWallet(identifier);
        require(recipient != address(0), "Recipient not found");
        require(recipient != msg.sender, "Cannot send to yourself");
        
        uint256 fee = (feeBps > 0 && feeRecipient != address(0)) ? (amount * feeBps) / 10_000 : 0;
        uint256 net = amount - fee;
        balances[msg.sender] -= amount;
        balances[recipient] += net;
        if (fee > 0) {
            balances[feeRecipient] += fee;
        }
        
        // Record payment history
        Payment memory payment = Payment({
            from: msg.sender,
            to: recipient,
            amount: amount,
            token: address(0),
            identifier: identifier,
            timestamp: block.timestamp
        });
        
        sentPayments[msg.sender].push(payment);
        receivedPayments[recipient].push(payment);
        
        emit PaymentSent(msg.sender, recipient, amount, identifier);
        emit PaymentReceived(msg.sender, recipient, amount);
    }

    /**
     * @dev Send ERC20 token payment using phone number or username
     * @param identifier Phone number or username of recipient
     * @param token Token contract address
     * @param amount Amount to send
     */
    function sendTokenPayment(string memory identifier, address token, uint256 amount) 
        external 
        validAmount(amount) 
        nonReentrant 
    {
        require(token != address(0), "Invalid token address");
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        
        address recipient = userRegistry.getWallet(identifier);
        require(recipient != address(0), "Recipient not found");
        require(recipient != msg.sender, "Cannot send to yourself");
        
        uint256 fee = (feeBps > 0 && feeRecipient != address(0)) ? (amount * feeBps) / 10_000 : 0;
        uint256 net = amount - fee;
        tokenBalances[msg.sender][token] -= amount;
        tokenBalances[recipient][token] += net;
        if (fee > 0) {
            tokenBalances[feeRecipient][token] += fee;
        }
        
        // Record payment history
        Payment memory payment = Payment({
            from: msg.sender,
            to: recipient,
            amount: amount,
            token: token,
            identifier: identifier,
            timestamp: block.timestamp
        });
        
        sentPayments[msg.sender].push(payment);
        receivedPayments[recipient].push(payment);
        
        emit TokenPaymentSent(msg.sender, recipient, token, amount, identifier);
        emit TokenPaymentReceived(msg.sender, recipient, token, amount);
    }

    /**
     * @dev Send direct ETH payment to address (fallback)
     * @param recipient Recipient address
     * @param amount Amount to send
     */
    function sendDirectPayment(address recipient, uint256 amount) 
        external 
        validAmount(amount) 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient address");
        require(recipient != msg.sender, "Cannot send to yourself");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        
        // Record payment history
        Payment memory payment = Payment({
            from: msg.sender,
            to: recipient,
            amount: amount,
            token: address(0),
            identifier: "",
            timestamp: block.timestamp
        });
        
        sentPayments[msg.sender].push(payment);
        receivedPayments[recipient].push(payment);
        
        emit PaymentSent(msg.sender, recipient, amount, "");
        emit PaymentReceived(msg.sender, recipient, amount);
    }

    /**
     * @dev Get user's ETH balance
     * @param user User address
     * @return User's ETH balance
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @dev Get user's token balance
     * @param user User address
     * @param token Token address
     * @return User's token balance
     */
    function getTokenBalance(address user, address token) external view returns (uint256) {
        return tokenBalances[user][token];
    }

    /**
     * @dev Get sent payment history
     * @param user User address
     * @return Array of sent payments
     */
    function getSentPayments(address user) external view returns (Payment[] memory) {
        return sentPayments[user];
    }

    /**
     * @dev Get received payment history
     * @param user User address
     * @return Array of received payments
     */
    function getReceivedPayments(address user) external view returns (Payment[] memory) {
        return receivedPayments[user];
    }

    /**
     * @dev Get recent transactions (both sent and received)
     * @param user User address
     * @param limit Maximum number of transactions to return
     * @return Array of recent payments
     */
    function getRecentTransactions(address user, uint256 limit) external view returns (Payment[] memory) {
        Payment[] memory sent = sentPayments[user];
        Payment[] memory received = receivedPayments[user];
        
        uint256 totalCount = sent.length + received.length;
        uint256 returnCount = totalCount > limit ? limit : totalCount;
        
        Payment[] memory recent = new Payment[](returnCount);
        
        // Simple merge sort by timestamp (descending)
        uint256 sentIndex = 0;
        uint256 receivedIndex = 0;
        
        for (uint256 i = 0; i < returnCount; i++) {
            if (sentIndex < sent.length && receivedIndex < received.length) {
                if (sent[sent.length - 1 - sentIndex].timestamp > received[received.length - 1 - receivedIndex].timestamp) {
                    recent[i] = sent[sent.length - 1 - sentIndex];
                    sentIndex++;
                } else {
                    recent[i] = received[received.length - 1 - receivedIndex];
                    receivedIndex++;
                }
            } else if (sentIndex < sent.length) {
                recent[i] = sent[sent.length - 1 - sentIndex];
                sentIndex++;
            } else {
                recent[i] = received[received.length - 1 - receivedIndex];
                receivedIndex++;
            }
        }
        
        return recent;
    }

    /**
     * @dev Get total ETH balance for a list of users (helper for per-user sums)
     */
    function getEthBalances(address[] calldata users) external view returns (uint256[] memory) {
        uint256[] memory out = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            out[i] = balances[users[i]];
        }
        return out;
    }

    /**
     * @dev Get total token balances for a list of users and a given token
     */
    function getTokenBalances(address token, address[] calldata users) external view returns (uint256[] memory) {
        uint256[] memory out = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            out[i] = tokenBalances[users[i]][token];
        }
        return out;
    }

    /**
     * @dev Owner can set fee (in basis points) and fee recipient
     */
    function setFee(uint256 _feeBps, address _feeRecipient) external onlyOwner {
        require(_feeBps <= 1_000, "Fee too high"); // max 10%
        require(_feeRecipient != address(0), "Invalid recipient");
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Update user registry address (only owner)
     * @param _userRegistry New user registry address
     */
    function updateUserRegistry(address _userRegistry) external onlyOwner {
        require(_userRegistry != address(0), "Invalid registry address");
        userRegistry = UserRegistry(_userRegistry);
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }

    // Receive function to accept ETH
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}