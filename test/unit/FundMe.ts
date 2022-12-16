import { expect, assert } from "chai";
import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";

describe("FundMe", function() {
  let fundMe: Contract, deployer: string, mockV3Aggregator: Contract;
  const sendValue = ethers.utils.parseEther("1"); // give us 1 ETH
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
      const response = await fundMe.s_priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("FundMe", async function() {
    it("Fail to fund because not enough ETH", async function() {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("Updated the amount funded data structure", async function() {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds funder to array of s_funders", async function() {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.s_funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe("Withdraw", async function() {
    beforeEach(async function() {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single founder", async function() {
      // Arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      // TransactionReceipt provides gasUsed and effectiveGasPrice field which we can use to calculate gas cost
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance.toString(), "0");

      // We have to add gasCost because it cost gas to withdraw
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("Withdraw from multiple s_funders", async function() {
      const accounts = await ethers.getSigners();

      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;

      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingDeployerBalance
          .add(startingFundMeBalance)
          .sub(gasCost)
          .toString(),
        endingDeployerBalance.toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("cheaper withdraw...", async function() {
      const accounts = await ethers.getSigners();

      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;

      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingDeployerBalance
          .add(startingFundMeBalance)
          .sub(gasCost)
          .toString(),
        endingDeployerBalance.toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async function() {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);

      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });
});

/// FOR MY OWN SELF STUDY
/**
 * 
 * Below code demonstrats that deploying and calling the fund function cost gas, which can affect
 * assertion during testing if you're comparing gas amounts 
 * 
 * 
 * output: 
 *      Starting balance 10000000000000000000000
 *      Balance after deployment 9999997384434667442633
 *      Balance after fund 9998997209270849054653
 * 
 * 
  const sendValue = ethers.utils.parseEther("1"); // give us 1 ETH
  it("test deployer amount", async function() {
    const { deployer } = await getNamedAccounts();
    const startingBalance = await ethers.provider.getBalance(deployer);
    console.log("Starting balance", startingBalance.toString());

    await deployments.fixture(["all"]);

    const balanceAfterDeployment = await ethers.provider.getBalance(deployer);
    console.log("Balance after deployment", balanceAfterDeployment.toString());

    const fundMe = await ethers.getContract("FundMe", deployer);

    await fundMe.fund({ value: sendValue });

    const balanceAfterFund = await ethers.provider.getBalance(deployer);
    console.log("Balance after fund", balanceAfterFund.toString());
  });
 */
