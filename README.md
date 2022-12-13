# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

---

## Hardhat Deploy (https://github.com/wighawag/hardhat-deploy)

This makes keeping track of deploy scripts and testing code much easier.
It looks for the /deploy folder.
In the deploy folder it executes all the scripts in order. So we can prepend the folder name with nummbers such as 00-fileName , 01-fileName, 02-fileName and etc.

installation :

1. yarn add --dev hardhat-deploy
2. yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers (overring hardhat-ethers with hardhat-deploy-ethers)

hardhat.config.ts : import "hardhat-deploy"
run: yarn hardhat deploy

starting code for deploy scripts. deployments and getNamedAccounts both comes for hre (hardhat runtime environment):
const { deploy, log } = deployments;
const { deployer } = await getNamedAccounts();
const chainId = network.config.chainId

## helper-hardhat.config

We can use this helper file to return network information based on the chainId

## 00-deploy-mocks.ts

This deploys the Mock Aggregator for network such as the hardhat or the localhost
Since the MockAggregator is a contract at the core, we can deploy that contract first and then use it for our Hardhat/Localhost network in the 01-deploy-fund-me.ts script
The reason we can't use the original Aggregator contract is because hardhat/localhost does not have an ETH/USD priceFeed contract on chainlink. Therefore we have to make a mock and deploy the aggregator to the local network.
Then we can use that mocked Aggreagators address with the AggregatorV3Interface.
