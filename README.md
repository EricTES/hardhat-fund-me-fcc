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

## Debuging using VSC

First select a breakpoint on your code. It should show a red dot on the left side of you code.

Then click Run and Debug on the left panel , and click Javascript Debug Terminal
This opens up a new terminal where you can run you test command and it will stop at your breakpoint.

## Grabbing gas cost

When we run a function from a contract it returns the transactionResponse. With the transactionResponse we can use the wait(// block confirmations) to get a transactionReceipt which contains the "gasUsed" and "effectiveGasPrice" field.
Multiple the two fields together to get the total gasCost

Note: The fields are in BigNumber so we have to use their built in function to do maths e.g add(), mul()...

```
const transactionResponse = await fundMe.withdraw();
const transactionReceipt = await transactionResponse.wait(1);
const { gasUsed, effectiveGasPrice } = transactionReceipt;
const gasCost = gasUsed.mul(effectiveGasPrice);
```

## Syntax I noticed that both does the same thing

FundMe.ts: - ethers.provider.getBalance( ) vs fundMe.provider.getBalance( )

01-deploy-fund-me: - ethers.getContract("MockV3Aggregator") vs deployments.get("MockV3Aggregator")

## Connecting contract to a different wallet/address

You can connect a different address to a contract using the Contract.connect(//signer)
Note, that it accepts Signers and not addresses. You can get the signers from ethers.
Also notice how in the example below it returns a new instance of a contract, fundMeConnectedContract.
The original fundMe is still connected to the deployer/owner

```
    const accounts = await ethers.getSigners();
    const fundMeConnectedContract = fundMe.connect(accounts[i]);
    await fundMeConnectedContract.fund({ value: sendValue });
```

## Layout of State Variables in Storage (https://docs.soliditylang.org/en/v0.8.17/internals/layout_in_storage.html)

- Each storage slot is 32 bytes
- Solidity will try to fit as much variable into a storage slot as possible. e.g two variables of size 16 bytes will fit into one storage slot
- When a slot is full or doens't have enough space to accomadate, a new slot is open up
- The variables are put into slots in the order you declare them in. E.g :

```
    uint256 public variable1;
    uint128 public variable2;
    uint128 public variable3;
```

Based on the example above the storage order will be variable1 -> variable2 -> variable3;

- In a similar token, how you order your variables could affect the amount of storage space you use. So take the above example, we would only use up two storage slot. However if i alter the code as shown below, we would end up using three storage slot:

```uint128 public variable2;
    uint256 public variable1;
    uint128 public variable3;
```

This is because uint128 = 16 bytes whilst uint256 = 32 bytes. Therefore variable2 and variable1 won't fit into a slot together so we have to make a new slot just for variable2. Then comes variable3 which won't fit together with variable2 since it takes up an entire slot, so we need to make another on for variable3. In total giving us three storage slots.

- Struct , Arrays and Maps always get's move to their own slot regardless.
- In that slot they don't store the actual data but rather the length. Except for Maps, which is empty.
- Their data is store somewhere else using a combination of keccak256() hashing and math calculations. Refer to the link to see the calculations.

- Bytes and Strings are very much like Arrays and therefore behave like them. However, if the size of the Bytes or String is smaller than 32 bytes all together then the data is also store together with the length in that one slot.

- The storage object of a contract comes with two fields, the "storage" and "types" field.
- The "storage" field gives us many information, amongst them is the storage slot index and the type of data which is linked to the types field by name.
- The "types" fields give us information about the byte size and other things.

e.g

```
{
    "storage": [
        {
        "astId": 15,
        "contract": "fileA:A",
        "label": "x",
        "offset": 0,
        "slot": "0",
        "type": "t_uint256"
        },
    ]
    "types": {
        "t_uint256": {
            "encoding": "inplace",
            "label": "uint256",
            "numberOfBytes": "32"
            }
        }
}
```

## Gas cost is calculated with OpCodes

The files in /artifacts/build-info have opcodes. This opcode tells solidity how much gas is used in total.

https://github.com/crytic/evm-opcodes - this links tells you how much each action cost.

Saving word to storage cost the most gas 20000+. Which is why we need to specify memory keyword in out solidity functions.
