import { assert } from "chai";
import { Contract } from "ethers";
import { ethers, getNamedAccounts, network } from "hardhat";
import { developmentChain } from "../../helper-hardhat-config";

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe: Contract, deployer: string;
      const sendValue = ethers.utils.parseEther("0.1");
      beforeEach(async function() {
        console.log("Starting the before each");
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        console.log("Finish the before each");
      });

      it("Fund and Withdraw", async function() {
        console.log("Starting the Fund and withdraw");
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
