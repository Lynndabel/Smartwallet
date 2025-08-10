// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/UserRegistry.sol";
import "../src/WalletFactory.sol";
import "../src/SmartWallet.sol";
import "../src/PaymentProcessor.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy UserRegistry
        console.log("1. Deploying UserRegistry...");
        UserRegistry userRegistry = new UserRegistry();
        console.log("UserRegistry:", address(userRegistry));
        
        // 2. Deploy WalletFactory
        console.log("2. Deploying WalletFactory...");
        WalletFactory walletFactory = new WalletFactory(address(userRegistry));
        console.log("WalletFactory:", address(walletFactory));
        console.log("SmartWallet Implementation:", walletFactory.smartWalletImplementation());
        
        // 3. Deploy sample SmartWallet
        console.log("3. Deploying sample SmartWallet...");
        SmartWallet sampleWallet = new SmartWallet(address(userRegistry));
        console.log("Sample SmartWallet:", address(sampleWallet));
        
        // 4. Deploy PaymentProcessor
        console.log("4. Deploying PaymentProcessor...");
        PaymentProcessor paymentProcessor = new PaymentProcessor(
            address(sampleWallet),
            address(userRegistry)
        );
        console.log("PaymentProcessor:", address(paymentProcessor));
        
        // 5. Set deployment fee
        console.log("5. Setting deployment fee...");
        walletFactory.setDeploymentFee(1000000000000000); // 0.001 ETH
        
        // 6. Reserve usernames
        console.log("6. Reserving usernames...");
        string[] memory usernames = new string[](8);
        usernames[0] = "admin";
        usernames[1] = "root";
        usernames[2] = "system";
        usernames[3] = "wallet";
        usernames[4] = "support";
        usernames[5] = "help";
        usernames[6] = "api";
        usernames[7] = "bot";
        userRegistry.reserveUsernames(usernames);
        
        vm.stopBroadcast();
        
        console.log("\n=== ALL DEPLOYED ===");
        console.log("UserRegistry:", address(userRegistry));
        console.log("WalletFactory:", address(walletFactory));
        console.log("SmartWallet Implementation:", walletFactory.smartWalletImplementation());
        console.log("Sample SmartWallet:", address(sampleWallet));
        console.log("PaymentProcessor:", address(paymentProcessor));
    }
}