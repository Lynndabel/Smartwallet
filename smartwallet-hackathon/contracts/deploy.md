# SmartWallet Hackathon Deployment

This project contains the deployment details of the **SmartWallet** contracts to the **Morph Testnet** using [Foundry](https://book.getfoundry.sh/forge/).

---

## 📦 Deployment Summary

### ✅ Script Command

```bash
forge script script/Deploy.s.sol --rpc-url morph --broadcast --verify --ffi
```

### ✅ Deployment Status

* All contracts were deployed successfully.
* Post-deployment setup completed.
* Artifacts and ABIs saved locally.

---

## 🛠 Deployment Details

* **Network**: `morph-testnet`
* **Chain ID**: `2810`
* **Deployer Address**: `0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38`
* **Deployed At (Unix Timestamp)**: `1754125712`
* **Deployment Fee**: `1000000000000000 wei`
* **Reserved Usernames**: `8`

---

## 📂 Deployed Contracts

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| `UserRegistry`       | `0xe4EaD55d3a66D33346d673F0462D1c1c56Ce823B` |
| `WalletFactory`      | `0x19d4394Fd05576C0D5DE1b46ebE171D794Bf1B03` |
| `SmartWallet Impl.`  | `0xf898fb31c7Dc1E6ab08B95f051f6d60cf9d4CcA9` |
| `Sample SmartWallet` | `0x76b012353964f95BF01c76Df6Ae8659bf2F92B05` |
| `PaymentProcessor`   | `0x4Df8049D6ef34fF94a5eb86030a0D6d2c1FD6050` |

---

## ✅ Post-deployment Setup

* Deployment fee configured.
* 8 usernames successfully reserved.
* ABIs saved to: `deployments/abis/`
* Addresses saved to: `deployments/morph-testnet.json`

---

## 🔍 Contract Verification Commands

You can verify deployed contracts with the following commands:

### `UserRegistry`

```bash
forge verify-contract \
  0xe4EaD55d3a66D33346d673F0462D1c1c56Ce823B \
  src/UserRegistry.sol:UserRegistry \
  --rpc-url morph
```

### `WalletFactory`

```bash
forge verify-contract \
  0x19d4394Fd05576C0D5DE1b46ebE171D794Bf1B03 \
  src/WalletFactory.sol:WalletFactory \
  --constructor-args 0xe4EaD55d3a66D33346d673F0462D1c1c56Ce823B \
  --rpc-url morph
```

### `SmartWallet`

```bash
forge verify-contract \
  0x76b012353964f95BF01c76Df6Ae8659bf2F92B05 \
  src/SmartWallet.sol:SmartWallet \
  --constructor-args 0xe4EaD55d3a66D33346d673F0462D1c1c56Ce823B \
  --rpc-url morph
```

### `PaymentProcessor`

```bash
forge verify-contract \
  0x4Df8049D6ef34fF94a5eb86030a0D6d2c1FD6050 \
  src/PaymentProcessor.sol:PaymentProcessor \
  --constructor-args 0x76b012353964f95BF01c76Df6Ae8659bf2F92B05 0xe4EaD55d3a66D33346d673F0462D1c1c56Ce823B \
  --rpc-url morph
```

---

## ⚠️ Note

* One contract exceeded the EVM size limit (`28229 > 24576`).
* Estimated total gas used: `28,922,827`
* Estimated cost: `~0.000057845682922827 ETH`
* All 6 transactions confirmed successfully.

---

## 📁 Folder Structure for Deployment Artifacts

```
deployments/
├── abis/
│   ├── UserRegistry.json
│   ├── WalletFactory.json
│   └── ...
└── morph-testnet.json
```

---

## 📞 Contact

For support or questions about the deployment, please reach out to the team or open an issue.


