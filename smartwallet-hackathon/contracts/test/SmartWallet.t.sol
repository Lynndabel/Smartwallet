// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/SmartWallet.sol";
import "../src/UserRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract SmartWalletTest is Test {
    SmartWallet public smartWallet;
    UserRegistry public userRegistry;
    MockERC20 public mockToken;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    // Events from SmartWallet contract
    event PaymentSent(address indexed from, address indexed to, uint256 amount, string identifier);
    event PaymentReceived(address indexed from, address indexed to, uint256 amount);
    event TokenPaymentSent(address indexed from, address indexed to, address indexed token, uint256 amount, string identifier);
    event TokenPaymentReceived(address indexed from, address indexed to, address indexed token, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event TokenDeposit(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawal(address indexed user, address indexed token, uint256 amount);

    // Add receive function to accept ETH from emergency withdraw
    receive() external payable {}

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        userRegistry = new UserRegistry();
        smartWallet = new SmartWallet(address(userRegistry));
        mockToken = new MockERC20();
        
        // Setup test users
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        
        // Register users
        userRegistry.registerUser("+1234567890", "phone", user1);
        userRegistry.registerUser("alice", "username", user2);
        userRegistry.registerUser("+0987654321", "phone", user3);
        
        // Mint tokens to users
        mockToken.mint(user1, 1000 * 10**18);
        mockToken.mint(user2, 1000 * 10**18);
        mockToken.mint(user3, 1000 * 10**18);
    }

    function testDeposit() public {
        uint256 depositAmount = 1 ether;
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Deposit(user1, depositAmount);
        
        smartWallet.deposit{value: depositAmount}();
        
        assertEq(smartWallet.getBalance(user1), depositAmount);
    }

    function testDepositViaReceive() public {
        uint256 depositAmount = 1 ether;
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Deposit(user1, depositAmount);
        
        (bool success, ) = address(smartWallet).call{value: depositAmount}("");
        assertTrue(success);
        
        assertEq(smartWallet.getBalance(user1), depositAmount);
    }

    function testDepositToken() public {
        uint256 depositAmount = 100 * 10**18;
        
        vm.startPrank(user1);
        mockToken.approve(address(smartWallet), depositAmount);
        
        vm.expectEmit(true, true, false, true);
        emit TokenDeposit(user1, address(mockToken), depositAmount);
        
        smartWallet.depositToken(address(mockToken), depositAmount);
        vm.stopPrank();
        
        assertEq(smartWallet.getTokenBalance(user1, address(mockToken)), depositAmount);
    }

    function testWithdraw() public {
        uint256 depositAmount = 1 ether;
        uint256 withdrawAmount = 0.5 ether;
        
        // Deposit first
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        uint256 initialBalance = user1.balance;
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(user1, withdrawAmount);
        
        smartWallet.withdraw(withdrawAmount);
        
        assertEq(smartWallet.getBalance(user1), depositAmount - withdrawAmount);
        assertEq(user1.balance, initialBalance + withdrawAmount);
    }

    function testWithdrawToken() public {
        uint256 depositAmount = 100 * 10**18;
        uint256 withdrawAmount = 50 * 10**18;
        
        // Deposit first
        vm.startPrank(user1);
        mockToken.approve(address(smartWallet), depositAmount);
        smartWallet.depositToken(address(mockToken), depositAmount);
        
        uint256 initialBalance = mockToken.balanceOf(user1);
        
        vm.expectEmit(true, true, false, true);
        emit TokenWithdrawal(user1, address(mockToken), withdrawAmount);
        
        smartWallet.withdrawToken(address(mockToken), withdrawAmount);
        vm.stopPrank();
        
        assertEq(smartWallet.getTokenBalance(user1, address(mockToken)), depositAmount - withdrawAmount);
        assertEq(mockToken.balanceOf(user1), initialBalance + withdrawAmount);
    }

    function testSendPaymentByPhone() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.3 ether;
        string memory recipientPhone = "+0987654321";
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit PaymentSent(user1, user3, sendAmount, recipientPhone);
        
        smartWallet.sendPayment(recipientPhone, sendAmount);
        
        assertEq(smartWallet.getBalance(user1), depositAmount - sendAmount);
        assertEq(smartWallet.getBalance(user3), sendAmount);
    }

    function testSendPaymentByUsername() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.3 ether;
        string memory recipientUsername = "alice";
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit PaymentSent(user1, user2, sendAmount, recipientUsername);
        
        smartWallet.sendPayment(recipientUsername, sendAmount);
        
        assertEq(smartWallet.getBalance(user1), depositAmount - sendAmount);
        assertEq(smartWallet.getBalance(user2), sendAmount);
    }

    function testSendTokenPayment() public {
        uint256 depositAmount = 100 * 10**18;
        uint256 sendAmount = 30 * 10**18;
        string memory recipientUsername = "alice";
        
        // User1 deposits tokens
        vm.startPrank(user1);
        mockToken.approve(address(smartWallet), depositAmount);
        smartWallet.depositToken(address(mockToken), depositAmount);
        
        vm.expectEmit(true, true, true, true);
        emit TokenPaymentSent(user1, user2, address(mockToken), sendAmount, recipientUsername);
        
        smartWallet.sendTokenPayment(recipientUsername, address(mockToken), sendAmount);
        vm.stopPrank();
        
        assertEq(smartWallet.getTokenBalance(user1, address(mockToken)), depositAmount - sendAmount);
        assertEq(smartWallet.getTokenBalance(user2, address(mockToken)), sendAmount);
    }

    function testSendDirectPayment() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.3 ether;
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit PaymentSent(user1, user2, sendAmount, "");
        
        smartWallet.sendDirectPayment(user2, sendAmount);
        
        assertEq(smartWallet.getBalance(user1), depositAmount - sendAmount);
        assertEq(smartWallet.getBalance(user2), sendAmount);
    }

    function test_RevertWhen_SendPaymentInsufficientBalance() public {
        uint256 sendAmount = 1 ether;
        string memory recipientPhone = "+0987654321";
        
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        smartWallet.sendPayment(recipientPhone, sendAmount);
    }

    function test_RevertWhen_SendPaymentToSelf() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.3 ether;
        string memory senderPhone = "+1234567890";
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        vm.prank(user1);
        vm.expectRevert("Cannot send to yourself");
        smartWallet.sendPayment(senderPhone, sendAmount);
    }

    function test_RevertWhen_SendPaymentNonexistentRecipient() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.3 ether;
        string memory nonexistentPhone = "+9999999999";
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        vm.prank(user1);
        vm.expectRevert("Identifier not registered");
        smartWallet.sendPayment(nonexistentPhone, sendAmount);
    }

    function test_RevertWhen_WithdrawInsufficientBalance() public {
        uint256 withdrawAmount = 1 ether;
        
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        smartWallet.withdraw(withdrawAmount);
    }

    function test_RevertWhen_SendZeroAmount() public {
        string memory recipientPhone = "+0987654321";
        
        vm.prank(user1);
        vm.expectRevert("Amount must be greater than 0");
        smartWallet.sendPayment(recipientPhone, 0);
    }

    function testPaymentHistory() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount1 = 0.2 ether;
        uint256 sendAmount2 = 0.3 ether;
        
        // User1 deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        
        // User2 deposits
        vm.prank(user2);
        smartWallet.deposit{value: depositAmount}();
        
        // User1 sends to user3
        vm.prank(user1);
        smartWallet.sendPayment("+0987654321", sendAmount1);
        
        // User2 sends to user1
        vm.prank(user2);
        smartWallet.sendPayment("+1234567890", sendAmount2);
        
        // Check sent payments for user1
        SmartWallet.Payment[] memory sentPayments1 = smartWallet.getSentPayments(user1);
        assertEq(sentPayments1.length, 1);
        assertEq(sentPayments1[0].from, user1);
        assertEq(sentPayments1[0].to, user3);
        assertEq(sentPayments1[0].amount, sendAmount1);
        
        // Check received payments for user1
        SmartWallet.Payment[] memory receivedPayments1 = smartWallet.getReceivedPayments(user1);
        assertEq(receivedPayments1.length, 1);
        assertEq(receivedPayments1[0].from, user2);
        assertEq(receivedPayments1[0].to, user1);
        assertEq(receivedPayments1[0].amount, sendAmount2);
    }

    function testGetRecentTransactions() public {
        uint256 depositAmount = 1 ether;
        uint256 sendAmount = 0.2 ether;
        
        // Setup deposits
        vm.prank(user1);
        smartWallet.deposit{value: depositAmount}();
        vm.prank(user2);
        smartWallet.deposit{value: depositAmount}();
        vm.prank(user3);
        smartWallet.deposit{value: depositAmount}();
        
        // Create some transactions
        vm.prank(user1);
        smartWallet.sendPayment("+0987654321", sendAmount);
        
        vm.prank(user2);
        smartWallet.sendPayment("+1234567890", sendAmount);
        
        vm.prank(user3);
        smartWallet.sendPayment("alice", sendAmount);
        
        // Get recent transactions for user1 (should have 2: 1 sent, 1 received)
        SmartWallet.Payment[] memory recentTxs = smartWallet.getRecentTransactions(user1, 10);
        assertEq(recentTxs.length, 2);
    }

    function testUpdateUserRegistry() public {
        UserRegistry newRegistry = new UserRegistry();
        
        smartWallet.updateUserRegistry(address(newRegistry));
        
        assertEq(address(smartWallet.userRegistry()), address(newRegistry));
    }

    function test_RevertWhen_UpdateUserRegistryNonOwner() public {
        UserRegistry newRegistry = new UserRegistry();
        
        vm.prank(user1);
        vm.expectRevert("Only owner can call this function");
        smartWallet.updateUserRegistry(address(newRegistry));
    }

    function testEmergencyWithdraw() public {
        uint256 amount = 1 ether;
        
        // Deposit some ETH directly to contract
        vm.deal(address(smartWallet), amount);
        
        uint256 initialBalance = owner.balance;
        
        smartWallet.emergencyWithdraw();
        
        assertEq(owner.balance, initialBalance + amount);
    }

    function test_RevertWhen_EmergencyWithdrawNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner can call this function");
        smartWallet.emergencyWithdraw();
    }
}