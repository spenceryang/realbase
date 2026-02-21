import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [DEPLOYER_KEY],
      chainId: 84532,
    },
    "base-mainnet": {
      url: "https://mainnet.base.org",
      accounts: [DEPLOYER_KEY],
      chainId: 8453,
    },
  },
};

export default config;
