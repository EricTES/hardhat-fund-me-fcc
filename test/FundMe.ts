import { expect, assert } from "chai";
import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts, getChainId } from "hardhat";

describe("FundMe", function() {
  let fundMe: Contract, deployer, mockV3Aggregator: Contract;
  beforeEach(async function() {
    deployer = (await getNamedAccounts()).deployer;

    // deployment has a fixture function that runs all the deploy script based on the input tags
    await deployments.fixture(["all"]);

    // The first param gives us the most recently deployed FundMe contract. This comes from hardhat-deploy package when we ran the code above.
    // The second param, deployer, is saying we want the FundMe contract to link to the deployer.
    fundMe = await ethers.getContract("FundMe", deployer);

    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

    // Below code is another way of grabbing the accounts from the network field in the hardhat config file
    // const accounts = await ethers.getSigners();
    // const accountZero = accounts[0]
  });

  describe("constructor", async function() {
    it("sets the aggregator addresses correctly", async function() {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
});
