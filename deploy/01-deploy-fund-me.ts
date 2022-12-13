import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import networkConfig, { developmentChain } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployFundMeFunction: DeployFunction = async function({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId || 5;

  let ethUsdPriceFeed;

  //if hardhat or localhost network we use the MockAggregator's address
  if (developmentChain.includes(network.name)) {
    const ethUsdMockAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeed = ethUsdMockAggregator.address;
  } else {
    ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeedAddress;
  }

  // Deploys the fund me contract
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed], // constructor parameters for FundMe contract
    log: true, // log out information about deployment
    waitConfirmations: 1, // wait 6 blocks confirmation
  });

  // Only verify the contract deployment if it's NOT a mock aggregator
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeed]);
  }

  log("-------------------------------------------");
};

export default deployFundMeFunction;
deployFundMeFunction.tags = ["all", "fundme"];
