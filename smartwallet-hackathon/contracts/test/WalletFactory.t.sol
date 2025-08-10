// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/WalletFactory.sol";
import "../src/UserRegistry.sol";
import "../src/SmartWallet.sol";

contract WalletFactoryTest is Test {
    WalletFactory public walletFactory;
    UserRegistry public userRegistry;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    // Event declarations for testing
    event WalletCreated(address indexed owner, address indexed wallet);



    // Add receive function to accept ETH from fee withdrawal
    receive() external payable {}

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        userRegistry = new UserRegistry();
        walletFactory = new WalletFactory(address(userRegistry));
        
        // Give users some ETH for deployment fees
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }

    function testCreateWallet() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit WalletCreated(user1, address(0)); // Only check owner, wallet address is dynamic
        
        address wallet = walletFactory.createWallet();
        
        assertTrue(wallet != address(0));
        assertEq(walletFactory.userToWallet(user1), wallet);
        assertEq(walletFactory.walletToUser(wallet), user1);
    }

    function testCreateWalletWithIdentifier() public {
        string memory phone = "+1234567890";
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit WalletCreated(user1, address(0)); // Only check owner, wallet address is dynamic
        
        address wallet = walletFactory.createWalletWithIdentifier(phone, "phone");
        
        assertTrue(wallet != address(0));
        assertEq(walletFactory.userToWallet(user1), wallet);
        assertEq(walletFactory.walletToUser(wallet), user1);
        
        // Check that identifier is registered
        assertEq(userRegistry.getWallet(phone), wallet);
    }

    function test_RevertWhen_CreateDuplicateWallet() public {
        vm.startPrank(user1);
        walletFactory.createWallet();
        
        vm.expectRevert("Wallet exists");
        walletFactory.createWallet();
        vm.stopPrank();
    }

    function testCreateMultipleWalletsForDifferentUsers() public {
        vm.prank(user1);
        address wallet1 = walletFactory.createWallet();
        
        vm.prank(user2);
        address wallet2 = walletFactory.createWallet();
        
        vm.prank(user3);
        address wallet3 = walletFactory.createWallet();
        
        assertTrue(wallet1 != wallet2 && wallet2 != wallet3 && wallet1 != wallet3);
        
        assertEq(walletFactory.userToWallet(user1), wallet1);
        assertEq(walletFactory.userToWallet(user2), wallet2);
        assertEq(walletFactory.userToWallet(user3), wallet3);
        
        assertEq(walletFactory.walletToUser(wallet1), user1);
        assertEq(walletFactory.walletToUser(wallet2), user2);
        assertEq(walletFactory.walletToUser(wallet3), user3);
    }

    function testSetDeploymentFee() public {
        uint256 newFee = 0.01 ether;
        
        walletFactory.setDeploymentFee(newFee);
        
        assertEq(walletFactory.deploymentFee(), newFee);
    }

    function test_RevertWhen_SetDeploymentFeeNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner");
        walletFactory.setDeploymentFee(0.01 ether);
    }

    function testCreateWalletWithFee() public {
        uint256 fee = 0.01 ether;
        walletFactory.setDeploymentFee(fee);
        
        vm.prank(user1);
        address wallet = walletFactory.createWallet{value: fee}();
        
        assertTrue(wallet != address(0));
        assertEq(address(walletFactory).balance, fee);
    }

    function test_RevertWhen_CreateWalletInsufficientFee() public {
        uint256 fee = 0.01 ether;
        walletFactory.setDeploymentFee(fee);
        
        vm.prank(user1);
        vm.expectRevert("Insufficient fee");
        walletFactory.createWallet{value: fee - 1}();
    }

    function testCreateWalletWithIdentifierWithFee() public {
        uint256 fee = 0.01 ether;
        walletFactory.setDeploymentFee(fee);
        string memory phone = "+1234567890";
        
        vm.prank(user1);
        address wallet = walletFactory.createWalletWithIdentifier{value: fee}(phone, "phone");
        
        assertTrue(wallet != address(0));
        assertEq(address(walletFactory).balance, fee);
        assertEq(userRegistry.getWallet(phone), wallet);
    }

    function test_RevertWhen_CreateWalletWithIdentifierInsufficientFee() public {
        uint256 fee = 0.01 ether;
        walletFactory.setDeploymentFee(fee);
        string memory phone = "+1234567890";
        
        vm.prank(user1);
        vm.expectRevert("Insufficient fee");
        walletFactory.createWalletWithIdentifier{value: fee - 1}(phone, "phone");
    }

    function testWithdrawFees() public {
        uint256 fee = 0.01 ether;
        walletFactory.setDeploymentFee(fee);
        
        // Create wallets with fees
        vm.prank(user1);
        walletFactory.createWallet{value: fee}();
        
        vm.prank(user2);
        walletFactory.createWallet{value: fee}();
        
        uint256 initialBalance = owner.balance;
        uint256 totalFees = fee * 2;
        
        walletFactory.withdrawFees();
        
        assertEq(owner.balance, initialBalance + totalFees);
        assertEq(address(walletFactory).balance, 0);
    }

    function test_RevertWhen_WithdrawFeesNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner");
        walletFactory.withdrawFees();
    }

    function testTransferOwnership() public {
        walletFactory.transferOwnership(user1);
        
        assertEq(walletFactory.owner(), user1);
    }

    function test_RevertWhen_TransferOwnershipNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner");
        walletFactory.transferOwnership(user2);
    }

    function test_RevertWhen_TransferOwnershipZeroAddress() public {
        vm.expectRevert("Invalid owner");
        walletFactory.transferOwnership(address(0));
    }

    function testConstructorWithValidRegistry() public {
        UserRegistry newRegistry = new UserRegistry();
        WalletFactory newFactory = new WalletFactory(address(newRegistry));
        
        assertEq(newFactory.userRegistry(), address(newRegistry));
        assertEq(newFactory.owner(), address(this));
        assertTrue(newFactory.smartWalletImplementation() != address(0));
    }

    function test_RevertWhen_ConstructorWithZeroRegistry() public {
        vm.expectRevert("Invalid registry");
        new WalletFactory(address(0));
    }

    function testSmartWalletImplementationIsSet() public view {
        assertTrue(walletFactory.smartWalletImplementation() != address(0));
    }

    function testWalletMappingsForNonexistentUser() public {
        assertEq(walletFactory.userToWallet(user1), address(0));
        assertEq(walletFactory.walletToUser(makeAddr("randomWallet")), address(0));
    }

    function testUserRegistryIsImmutable() public view {
        assertEq(walletFactory.userRegistry(), address(userRegistry));
    }

    function testInitialDeploymentFeeIsZero() public view {
        assertEq(walletFactory.deploymentFee(), 0);
    }

    function testInitialOwnerIsDeployer() public view {
        assertEq(walletFactory.owner(), owner);
    }
}