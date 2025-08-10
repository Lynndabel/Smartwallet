// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/UserRegistry.sol";

contract UserRegistryTest is Test {
    UserRegistry public userRegistry;
    address public owner;
    address public user1;
    address public user2;
    address public wallet1;
    address public wallet2;

    // Events from UserRegistry contract
    event UserRegistered(string identifier, address indexed wallet, string identifierType);
    event UserUpdated(string identifier, address indexed oldWallet, address indexed newWallet);
    event IdentifierRemoved(string identifier, address indexed wallet);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        wallet1 = makeAddr("wallet1");
        wallet2 = makeAddr("wallet2");
        
        userRegistry = new UserRegistry();
    }

    function testRegisterPhoneNumber() public {
        string memory phone = "+1234567890";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        address retrievedWallet = userRegistry.getWallet(phone);
        assertEq(retrievedWallet, wallet1);
        
        string[] memory identifiers = userRegistry.getIdentifiers(wallet1);
        assertEq(identifiers.length, 1);
        assertEq(identifiers[0], phone);
    }

    function testRegisterUsername() public {
        string memory username = "alice123";
        
        userRegistry.registerUser(username, "username", wallet1);
        
        address retrievedWallet = userRegistry.getWallet(username);
        assertEq(retrievedWallet, wallet1);
    }

    function testRegisterMultipleIdentifiers() public {
        string memory phone = "+1234567890";
        string memory username = "alice123";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        userRegistry.registerUser(username, "username", wallet1);
        
        string[] memory identifiers = userRegistry.getIdentifiers(wallet1);
        assertEq(identifiers.length, 2);
    }

    function test_RevertWhen_RegisterDuplicateIdentifier() public {
        string memory phone = "+1234567890";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        vm.expectRevert("Identifier already taken");
        userRegistry.registerUser(phone, "phone", wallet2);
    }

    function test_RevertWhen_RegisterInvalidPhoneNumber() public {
        string memory invalidPhone = "abc123";
        
        vm.expectRevert("Invalid phone number format");
        userRegistry.registerUser(invalidPhone, "phone", wallet1);
    }

    function test_RevertWhen_RegisterInvalidUsername() public {
        string memory invalidUsername = "a"; // Too short
        
        vm.expectRevert("Invalid username format");
        userRegistry.registerUser(invalidUsername, "username", wallet1);
    }

    function testUpdateWallet() public {
        string memory phone = "+1234567890";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        vm.prank(wallet1);
        userRegistry.updateWallet(phone, wallet2);
        
        address retrievedWallet = userRegistry.getWallet(phone);
        assertEq(retrievedWallet, wallet2);
        
        // Check that old wallet mapping is removed
        string[] memory oldIdentifiers = userRegistry.getIdentifiers(wallet1);
        assertEq(oldIdentifiers.length, 0);
        
        // Check that new wallet mapping is added
        string[] memory newIdentifiers = userRegistry.getIdentifiers(wallet2);
        assertEq(newIdentifiers.length, 1);
        assertEq(newIdentifiers[0], phone);
    }

    function test_RevertWhen_UpdateWalletUnauthorized() public {
        string memory phone = "+1234567890";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        vm.prank(wallet2); // Wrong wallet trying to update
        vm.expectRevert("Only wallet owner can update");
        userRegistry.updateWallet(phone, wallet2);
    }

    function testRemoveIdentifier() public {
        string memory phone = "+1234567890";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        vm.prank(wallet1);
        userRegistry.removeIdentifier(phone);
        
        vm.expectRevert("Identifier not registered");
        userRegistry.getWallet(phone);
        
        string[] memory identifiers = userRegistry.getIdentifiers(wallet1);
        assertEq(identifiers.length, 0);
    }

    function testIsAvailable() public {
        string memory phone = "+1234567890";
        
        assertTrue(userRegistry.isAvailable(phone));
        
        userRegistry.registerUser(phone, "phone", wallet1);
        
        assertFalse(userRegistry.isAvailable(phone));
    }

    function testReserveUsernames() public {
        string[] memory usernames = new string[](2);
        usernames[0] = "admin";
        usernames[1] = "root";
        
        userRegistry.reserveUsernames(usernames);
        
        assertFalse(userRegistry.isAvailable("admin"));
        assertFalse(userRegistry.isAvailable("root"));
        
        vm.expectRevert("Username reserved");
        userRegistry.registerUser("admin", "username", wallet1);
    }

    function testMaxIdentifiersPerWallet() public {
        // Register maximum allowed identifiers
        for (uint256 i = 0; i < 5; i++) {
            string memory username = string(abi.encodePacked("user", vm.toString(i)));
            userRegistry.registerUser(username, "username", wallet1);
        }
        
        // This should fail as it exceeds the limit
        vm.expectRevert("Max identifiers per wallet reached");
        userRegistry.registerUser("user5", "username", wallet1);
    }

    function testValidPhoneNumberFormats() public {
        // Test valid phone numbers
        userRegistry.registerUser("+1234567890", "phone", wallet1);
        userRegistry.registerUser("1234567890", "phone", wallet2);
        
        // Test invalid phone numbers
        vm.expectRevert("Invalid phone number format");
        userRegistry.registerUser("123", "phone", makeAddr("wallet3")); // Too short
        
        vm.expectRevert("Invalid phone number format");
        userRegistry.registerUser("123456789012345678901234567890", "phone", makeAddr("wallet4")); // Too long
        
        vm.expectRevert("Invalid phone number format");
        userRegistry.registerUser("+123abc456", "phone", makeAddr("wallet5")); // Contains letters
    }

    function testValidUsernameFormats() public {
        // Test valid usernames
        userRegistry.registerUser("alice123", "username", wallet1);
        userRegistry.registerUser("bob_doe", "username", wallet2);
        userRegistry.registerUser("charlie.smith", "username", makeAddr("wallet3"));
        
        // Test invalid usernames
        vm.expectRevert("Invalid username format");
        userRegistry.registerUser("ab", "username", makeAddr("wallet4")); // Too short
        
        vm.expectRevert("Invalid username format");
        userRegistry.registerUser("toolongusernamethatexceedslimit", "username", makeAddr("wallet5")); // Too long
        
        vm.expectRevert("Invalid username format");
        userRegistry.registerUser("user@name", "username", makeAddr("wallet6")); // Invalid character
    }

    function testGetIdentifiers() public {
        string memory phone = "+1234567890";
        string memory username = "alice123";
        
        userRegistry.registerUser(phone, "phone", wallet1);
        userRegistry.registerUser(username, "username", wallet1);
        
        string[] memory identifiers = userRegistry.getIdentifiers(wallet1);
        assertEq(identifiers.length, 2);
        
        // Check that both identifiers are present (order may vary)
        assertTrue(
            (keccak256(bytes(identifiers[0])) == keccak256(bytes(phone)) && 
             keccak256(bytes(identifiers[1])) == keccak256(bytes(username))) ||
            (keccak256(bytes(identifiers[0])) == keccak256(bytes(username)) && 
             keccak256(bytes(identifiers[1])) == keccak256(bytes(phone)))
        );
    }

    function test_RevertWhen_ZeroAddress() public {
        string memory phone = "+1234567890";
        
        vm.expectRevert("Invalid wallet address");
        userRegistry.registerUser(phone, "phone", address(0));
    }

    function test_RevertWhen_InvalidIdentifierType() public {
        string memory phone = "+1234567890";
        
        vm.expectRevert("Invalid identifier type");
        userRegistry.registerUser(phone, "invalid", wallet1);
    }

    function testEmptyIdentifier() public {
        vm.expectRevert("Empty identifier");
        userRegistry.registerUser("", "phone", wallet1);
    }
}