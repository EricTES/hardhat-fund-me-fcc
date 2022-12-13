export interface NetworkConfig {
  [key: number]: {
    name: string;
    ethUsdPriceFeedAddress: string;
  };
}

const networkConfig: NetworkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

export const developmentChain = ["hardhat", "localhost"];
export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;

export default networkConfig;
