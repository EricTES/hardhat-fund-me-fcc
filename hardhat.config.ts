import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.12",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.5.9",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: 5,
      //@ts-ignore
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // This specifies which account index we are choosing in the accounts array of the networks object.
  //E.g the deployer uses account at index of 0 for both default and goerli( chainId = 5)
  namedAccounts: {
    deployer: {
      default: 0,
      5: 0,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "BNB",
  },
};

export default config;
