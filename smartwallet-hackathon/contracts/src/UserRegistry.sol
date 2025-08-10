// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title UserRegistry
 * @dev Manages mapping between phone numbers/usernames and wallet addresses
 */
contract UserRegistry is Ownable, ReentrancyGuard {
    // Events
    event UserRegistered(string indexed identifier, address indexed wallet, string identifierType);
    event UserUpdated(string indexed identifier, address indexed oldWallet, address indexed newWallet);
    event IdentifierRemoved(string indexed identifier, address indexed wallet);

    // Structs
    struct UserInfo {
        address wallet;
        string identifierType; // "phone" or "username"
        uint256 registeredAt;
        bool isActive;
    }

    // Mappings
    mapping(string => UserInfo) public identifierToUser;
    mapping(address => string[]) public walletToIdentifiers;
    mapping(string => bool) public reservedUsernames;
    // Per-wallet type flags to restrict one phone and one username per wallet
    mapping(address => bool) public walletHasPhone;
    mapping(address => bool) public walletHasUsername;

    // Constants
    uint256 public constant MAX_IDENTIFIERS_PER_WALLET = 5;
    
    // Modifiers
    modifier validIdentifier(string memory identifier) {
        require(bytes(identifier).length > 0, "Empty identifier");
        require(bytes(identifier).length <= 50, "Identifier too long");
        _;
    }

    modifier identifierAvailable(string memory identifier) {
        require(!identifierToUser[identifier].isActive, "Identifier already taken");
        require(!reservedUsernames[identifier], "Username reserved");
        _;
    }

    constructor() {}

    /**
     * @dev Register a phone number or username to a wallet address
     * @param identifier Phone number or username
     * @param identifierType "phone" or "username"
     * @param wallet Address of the wallet
     */
    function registerUser(
        string memory identifier,
        string memory identifierType,
        address wallet
    ) external validIdentifier(identifier) identifierAvailable(identifier) nonReentrant {
        require(wallet != address(0), "Invalid wallet address");
        require(
            keccak256(bytes(identifierType)) == keccak256(bytes("phone")) || 
            keccak256(bytes(identifierType)) == keccak256(bytes("username")),
            "Invalid identifier type"
        );
        require(
            walletToIdentifiers[wallet].length < MAX_IDENTIFIERS_PER_WALLET,
            "Max identifiers per wallet reached"
        );

        // Validate phone number format (basic validation)
        if (keccak256(bytes(identifierType)) == keccak256(bytes("phone"))) {
            require(_isValidPhoneNumber(identifier), "Invalid phone number format");
            require(!walletHasPhone[wallet], "Phone already linked");
        }

        // Validate username format
        if (keccak256(bytes(identifierType)) == keccak256(bytes("username"))) {
            require(_isValidUsername(identifier), "Invalid username format");
            require(!walletHasUsername[wallet], "Username already linked");
        }

        // Register user
        identifierToUser[identifier] = UserInfo({
            wallet: wallet,
            identifierType: identifierType,
            registeredAt: block.timestamp,
            isActive: true
        });

        walletToIdentifiers[wallet].push(identifier);
        if (keccak256(bytes(identifierType)) == keccak256(bytes("phone"))) {
            walletHasPhone[wallet] = true;
        } else {
            walletHasUsername[wallet] = true;
        }

        emit UserRegistered(identifier, wallet, identifierType);
    }

    /**
     * @dev Update wallet address for an identifier
     * @param identifier Phone number or username
     * @param newWallet New wallet address
     */
    function updateWallet(string memory identifier, address newWallet) external nonReentrant {
        require(newWallet != address(0), "Invalid wallet address");
        UserInfo storage user = identifierToUser[identifier];
        require(user.isActive, "Identifier not registered");
        require(user.wallet == msg.sender, "Only wallet owner can update");

        address oldWallet = user.wallet;
        user.wallet = newWallet;

        // Update reverse mapping
        _removeIdentifierFromWallet(oldWallet, identifier);
        walletToIdentifiers[newWallet].push(identifier);

        // Update type flags for both wallets
        if (keccak256(bytes(user.identifierType)) == keccak256(bytes("phone"))) {
            walletHasPhone[oldWallet] = false;
            walletHasPhone[newWallet] = true;
        } else {
            walletHasUsername[oldWallet] = false;
            walletHasUsername[newWallet] = true;
        }

        emit UserUpdated(identifier, oldWallet, newWallet);
    }

    /**
     * @dev Remove an identifier
     * @param identifier Phone number or username to remove
     */
    function removeIdentifier(string memory identifier) external nonReentrant {
        UserInfo storage user = identifierToUser[identifier];
        require(user.isActive, "Identifier not registered");
        require(user.wallet == msg.sender, "Only wallet owner can remove");

        address wallet = user.wallet;
        user.isActive = false;

        _removeIdentifierFromWallet(wallet, identifier);

        // Clear type flag
        if (keccak256(bytes(user.identifierType)) == keccak256(bytes("phone"))) {
            walletHasPhone[wallet] = false;
        } else if (keccak256(bytes(user.identifierType)) == keccak256(bytes("username"))) {
            walletHasUsername[wallet] = false;
        }

        emit IdentifierRemoved(identifier, wallet);
    }

    /**
     * @dev Get wallet address for an identifier
     * @param identifier Phone number or username
     * @return wallet address
     */
    function getWallet(string memory identifier) external view returns (address) {
        UserInfo memory user = identifierToUser[identifier];
        require(user.isActive, "Identifier not registered");
        return user.wallet;
    }

    /**
     * @dev Get all identifiers for a wallet
     * @param wallet Wallet address
     * @return Array of identifiers
     */
    function getIdentifiers(address wallet) external view returns (string[] memory) {
        return walletToIdentifiers[wallet];
    }

    /**
     * @dev Check if identifier is available
     * @param identifier Phone number or username
     * @return True if available
     */
    function isAvailable(string memory identifier) external view returns (bool) {
        return !identifierToUser[identifier].isActive && !reservedUsernames[identifier];
    }

    /**
     * @dev Reserve usernames (only owner)
     * @param usernames Array of usernames to reserve
     */
    function reserveUsernames(string[] memory usernames) external onlyOwner {
        for (uint256 i = 0; i < usernames.length; i++) {
            reservedUsernames[usernames[i]] = true;
        }
    }

    // Internal functions
    function _removeIdentifierFromWallet(address wallet, string memory identifier) internal {
        string[] storage identifiers = walletToIdentifiers[wallet];
        for (uint256 i = 0; i < identifiers.length; i++) {
            if (keccak256(bytes(identifiers[i])) == keccak256(bytes(identifier))) {
                identifiers[i] = identifiers[identifiers.length - 1];
                identifiers.pop();
                break;
            }
        }
    }

    function _isValidPhoneNumber(string memory phone) internal pure returns (bool) {
        bytes memory phoneBytes = bytes(phone);
        if (phoneBytes.length < 10 || phoneBytes.length > 15) return false;
        
        // Check if starts with + and contains only digits after
        if (phoneBytes[0] == 0x2B) { // '+'
            for (uint256 i = 1; i < phoneBytes.length; i++) {
                if (phoneBytes[i] < 0x30 || phoneBytes[i] > 0x39) return false; // 0-9
            }
        } else {
            // Just digits
            for (uint256 i = 0; i < phoneBytes.length; i++) {
                if (phoneBytes[i] < 0x30 || phoneBytes[i] > 0x39) return false; // 0-9
            }
        }
        return true;
    }

    function _isValidUsername(string memory username) internal pure returns (bool) {
        bytes memory usernameBytes = bytes(username);
        if (usernameBytes.length < 3 || usernameBytes.length > 20) return false;
        
        for (uint256 i = 0; i < usernameBytes.length; i++) {
            bytes1 char = usernameBytes[i];
            // Allow a-z, A-Z, 0-9, underscore, dot
            if (!(
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x30 && char <= 0x39) || // 0-9
                char == 0x5F || // _
                char == 0x2E    // .
            )) {
                return false;
            }
        }
        return true;
    }
}