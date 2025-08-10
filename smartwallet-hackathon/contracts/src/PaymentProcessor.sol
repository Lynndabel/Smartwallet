// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SmartWallet.sol";
import "./UserRegistry.sol";

/**
 * @title PaymentProcessor
 * @dev Advanced payment processing features for smart wallets
 */
contract PaymentProcessor is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event BatchPaymentProcessed(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event PaymentRequestCreated(uint256 indexed requestId, address indexed requester, address indexed payer, uint256 amount);
    event PaymentRequestFulfilled(uint256 indexed requestId, address indexed payer);
    event PaymentRequestCancelled(uint256 indexed requestId);
    event ScheduledPaymentCreated(uint256 indexed scheduleId, address indexed payer, string recipient, uint256 amount);
    event ScheduledPaymentExecuted(uint256 indexed scheduleId);
    event ScheduledPaymentCancelled(uint256 indexed scheduleId);

    // Structs
    struct BatchPayment {
        string[] recipients;
        uint256[] amounts;
        address token; // address(0) for ETH
    }

    struct PaymentRequest {
        uint256 id;
        address requester;
        address payer;
        uint256 amount;
        address token;
        string message;
        uint256 createdAt;
        uint256 expiresAt;
        bool fulfilled;
        bool cancelled;
    }

    struct ScheduledPayment {
        uint256 id;
        address payer;
        string recipient;
        uint256 amount;
        address token;
        uint256 frequency; // in seconds
        uint256 nextExecution;
        uint256 totalExecutions;
        uint256 executedCount;
        bool active;
        uint256 createdAt;
    }

    // State variables
    SmartWallet public smartWallet;
    UserRegistry public userRegistry;
    
    uint256 public nextRequestId = 1;
    uint256 public nextScheduleId = 1;
    
    mapping(uint256 => PaymentRequest) public paymentRequests;
    mapping(address => uint256[]) public userPaymentRequests;
    mapping(address => uint256[]) public userPaymentRequestsSent;
    
    mapping(uint256 => ScheduledPayment) public scheduledPayments;
    mapping(address => uint256[]) public userScheduledPayments;
    
    // Fee configuration
    uint256 public batchPaymentFee = 0.001 ether; // Fee per batch
    uint256 public paymentRequestFee = 0.0005 ether; // Fee per request
    uint256 public scheduledPaymentFee = 0.002 ether; // Fee per scheduled payment
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _smartWallet, address _userRegistry) {
        smartWallet = SmartWallet(payable(_smartWallet));
        userRegistry = UserRegistry(_userRegistry);
        owner = msg.sender;
    }

    /**
     * @dev Process batch payments to multiple recipients
     * @param recipients Array of phone numbers/usernames
     * @param amounts Array of amounts to send
     * @param token Token address (address(0) for ETH)
     */
    function processBatchPayment(
        string[] memory recipients,
        uint256[] memory amounts,
        address token
    ) external payable nonReentrant {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "No recipients specified");
        require(msg.value >= batchPaymentFee, "Insufficient fee");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Invalid amount");
            totalAmount += amounts[i];
        }
        
        // Check balance
        if (token == address(0)) {
            require(smartWallet.getBalance(msg.sender) >= totalAmount, "Insufficient ETH balance");
        } else {
            require(smartWallet.getTokenBalance(msg.sender, token) >= totalAmount, "Insufficient token balance");
        }
        
        // Process each payment
        for (uint256 i = 0; i < recipients.length; i++) {
            if (token == address(0)) {
                smartWallet.sendPayment(recipients[i], amounts[i]);
            } else {
                smartWallet.sendTokenPayment(recipients[i], token, amounts[i]);
            }
        }
        
        emit BatchPaymentProcessed(msg.sender, totalAmount, recipients.length);
    }

    /**
     * @dev Create a payment request
     * @param payer Address of the person to request payment from
     * @param amount Amount to request
     * @param token Token address (address(0) for ETH)
     * @param message Optional message
     * @param expiryDuration Duration in seconds until request expires
     */
    function createPaymentRequest(
        address payer,
        uint256 amount,
        address token,
        string memory message,
        uint256 expiryDuration
    ) external payable nonReentrant returns (uint256 requestId) {
        require(msg.value >= paymentRequestFee, "Insufficient fee");
        require(payer != address(0), "Invalid payer address");
        require(payer != msg.sender, "Cannot request from yourself");
        require(amount > 0, "Amount must be greater than 0");
        require(expiryDuration > 0, "Invalid expiry duration");
        
        requestId = nextRequestId++;
        
        PaymentRequest storage request = paymentRequests[requestId];
        request.id = requestId;
        request.requester = msg.sender;
        request.payer = payer;
        request.amount = amount;
        request.token = token;
        request.message = message;
        request.createdAt = block.timestamp;
        request.expiresAt = block.timestamp + expiryDuration;
        request.fulfilled = false;
        request.cancelled = false;
        
        userPaymentRequests[payer].push(requestId);
        userPaymentRequestsSent[msg.sender].push(requestId);
        
        emit PaymentRequestCreated(requestId, msg.sender, payer, amount);
        
        return requestId;
    }

    /**
     * @dev Fulfill a payment request
     * @param requestId ID of the payment request
     */
    function fulfillPaymentRequest(uint256 requestId) external nonReentrant {
        PaymentRequest storage request = paymentRequests[requestId];
        require(request.payer == msg.sender, "Not authorized to fulfill this request");
        require(!request.fulfilled, "Request already fulfilled");
        require(!request.cancelled, "Request cancelled");
        require(block.timestamp <= request.expiresAt, "Request expired");
        
        // Check balance
        if (request.token == address(0)) {
            require(smartWallet.getBalance(msg.sender) >= request.amount, "Insufficient ETH balance");
            smartWallet.sendDirectPayment(request.requester, request.amount);
        } else {
            require(smartWallet.getTokenBalance(msg.sender, request.token) >= request.amount, "Insufficient token balance");
            // Would need to implement direct token payment in SmartWallet
        }
        
        request.fulfilled = true;
        
        emit PaymentRequestFulfilled(requestId, msg.sender);
    }

    /**
     * @dev Cancel a payment request
     * @param requestId ID of the payment request
     */
    function cancelPaymentRequest(uint256 requestId) external {
        PaymentRequest storage request = paymentRequests[requestId];
        require(
            request.requester == msg.sender || request.payer == msg.sender,
            "Not authorized to cancel this request"
        );
        require(!request.fulfilled, "Request already fulfilled");
        require(!request.cancelled, "Request already cancelled");
        
        request.cancelled = true;
        
        emit PaymentRequestCancelled(requestId);
    }

    /**
     * @dev Create a scheduled payment
     * @param recipient Phone number or username
     * @param amount Amount to send
     * @param token Token address (address(0) for ETH)
     * @param frequency Frequency in seconds
     * @param totalExecutions Total number of executions (0 for unlimited)
     */
    function createScheduledPayment(
        string memory recipient,
        uint256 amount,
        address token,
        uint256 frequency,
        uint256 totalExecutions
    ) external payable nonReentrant returns (uint256 scheduleId) {
        require(msg.value >= scheduledPaymentFee, "Insufficient fee");
        require(bytes(recipient).length > 0, "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(frequency >= 3600, "Minimum frequency is 1 hour"); // Prevent spam
        
        // Verify recipient exists
        userRegistry.getWallet(recipient);
        
        scheduleId = nextScheduleId++;
        
        ScheduledPayment storage schedule = scheduledPayments[scheduleId];
        schedule.id = scheduleId;
        schedule.payer = msg.sender;
        schedule.recipient = recipient;
        schedule.amount = amount;
        schedule.token = token;
        schedule.frequency = frequency;
        schedule.nextExecution = block.timestamp + frequency;
        schedule.totalExecutions = totalExecutions;
        schedule.executedCount = 0;
        schedule.active = true;
        schedule.createdAt = block.timestamp;
        
        userScheduledPayments[msg.sender].push(scheduleId);
        
        emit ScheduledPaymentCreated(scheduleId, msg.sender, recipient, amount);
        
        return scheduleId;
    }

    /**
     * @dev Execute a scheduled payment (can be called by anyone)
     * @param scheduleId ID of the scheduled payment
     */
    function executeScheduledPayment(uint256 scheduleId) external nonReentrant {
        ScheduledPayment storage schedule = scheduledPayments[scheduleId];
        require(schedule.active, "Scheduled payment not active");
        require(block.timestamp >= schedule.nextExecution, "Not time to execute yet");
        
        // Check if reached execution limit
        if (schedule.totalExecutions > 0 && schedule.executedCount >= schedule.totalExecutions) {
            schedule.active = false;
            return;
        }
        
        // Check balance
        if (schedule.token == address(0)) {
            require(smartWallet.getBalance(schedule.payer) >= schedule.amount, "Insufficient ETH balance");
            smartWallet.sendPayment(schedule.recipient, schedule.amount);
        } else {
            require(smartWallet.getTokenBalance(schedule.payer, schedule.token) >= schedule.amount, "Insufficient token balance");
            smartWallet.sendTokenPayment(schedule.recipient, schedule.token, schedule.amount);
        }
        
        schedule.executedCount++;
        schedule.nextExecution = block.timestamp + schedule.frequency;
        
        // Deactivate if reached execution limit
        if (schedule.totalExecutions > 0 && schedule.executedCount >= schedule.totalExecutions) {
            schedule.active = false;
        }
        
        emit ScheduledPaymentExecuted(scheduleId);
    }

    /**
     * @dev Cancel a scheduled payment
     * @param scheduleId ID of the scheduled payment
     */
    function cancelScheduledPayment(uint256 scheduleId) external {
        ScheduledPayment storage schedule = scheduledPayments[scheduleId];
        require(schedule.payer == msg.sender, "Not authorized to cancel this schedule");
        require(schedule.active, "Schedule already inactive");
        
        schedule.active = false;
        
        emit ScheduledPaymentCancelled(scheduleId);
    }

    // View functions
    function getPaymentRequest(uint256 requestId) external view returns (PaymentRequest memory) {
        return paymentRequests[requestId];
    }

    function getUserPaymentRequests(address user) external view returns (uint256[] memory) {
        return userPaymentRequests[user];
    }

    function getUserPaymentRequestsSent(address user) external view returns (uint256[] memory) {
        return userPaymentRequestsSent[user];
    }

    function getScheduledPayment(uint256 scheduleId) external view returns (ScheduledPayment memory) {
        return scheduledPayments[scheduleId];
    }

    function getUserScheduledPayments(address user) external view returns (uint256[] memory) {
        return userScheduledPayments[user];
    }

    // Admin functions
    function setFees(uint256 _batchFee, uint256 _requestFee, uint256 _scheduleFee) external onlyOwner {
        batchPaymentFee = _batchFee;
        paymentRequestFee = _requestFee;
        scheduledPaymentFee = _scheduleFee;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
}