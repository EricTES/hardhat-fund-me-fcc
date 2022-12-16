import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);

  await fundMe.fund({ value: ethers.utils.parseEther("1") });
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);

  console.log("Got it back");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
