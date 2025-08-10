// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SmartWallet.sol";
import "./UserRegistry.sol";

/**
 * @title WalletFactory - Minimal Version
 * @dev Minimal factory contract for deploying smart wallets
 */
contract WalletFactory {
    address public immutable userRegistry;
    address public immutable smartWalletImplementation;
    address public owner;
    uint256 public deploymentFee;
    
    mapping(address => address) public userToWallet;
    mapping(address => address) public walletToUser;
    
    event WalletCreated(address indexed owner, address indexed wallet);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "Invalid registry");
        userRegistry = _userRegistry;
        owner = msg.sender;
        smartWalletImplementation = address(new SmartWallet(_userRegistry));
    }

    function createWallet() external payable returns (address wallet) {
        require(msg.value >= deploymentFee, "Insufficient fee");
        require(userToWallet[msg.sender] == address(0), "Wallet exists");
        
        wallet = address(new SmartWallet(userRegistry));

        // Transfer ownership of the newly created wallet to the user
        SmartWallet(payable(wallet)).transferOwnership(msg.sender);
        
        userToWallet[msg.sender] = wallet;
        walletToUser[wallet] = msg.sender;
        
        emit WalletCreated(msg.sender, wallet);
    }

    function createWalletWithIdentifier(
        string memory identifier,
        string memory identifierType
    ) external payable returns (address wallet) {
        require(msg.value >= deploymentFee, "Insufficient fee");
        require(userToWallet[msg.sender] == address(0), "Wallet exists");
        
        wallet = address(new SmartWallet(userRegistry));
        
        // Transfer ownership of the newly created wallet to the user
        SmartWallet(payable(wallet)).transferOwnership(msg.sender);
        UserRegistry(userRegistry).registerUser(identifier, identifierType, wallet);
        
        userToWallet[msg.sender] = wallet;
        walletToUser[wallet] = msg.sender;
        
        emit WalletCreated(msg.sender, wallet);
    }

    function setDeploymentFee(uint256 fee) external onlyOwner {
        deploymentFee = fee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    /**
     * @dev Returns the deployed wallet address for a given user, or address(0) if none
     * @param user The EOA/user address
     */
    function getWallet(address user) external view returns (address) {
        return userToWallet[user];
    }

    /**
     * @dev Returns true if the given user already has a deployed wallet
     * @param user The EOA/user address
     */
    function hasWallet(address user) external view returns (bool) {
        return userToWallet[user] != address(0);
    }
}