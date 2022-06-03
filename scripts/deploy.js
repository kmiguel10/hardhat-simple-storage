//imports
const { ethers, run, network } = require("hardhat")

//async main
/**
 * Deploys, verifies, and interacts with smart contract
 */
async function main() {
    //get contract
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying contract...")
    const simpleStorage = await SimpleStorageFactory.deploy() //deploy
    await simpleStorage.deployed() //wait for contract to be deployed
    console.log(`Deployed contract to: ${simpleStorage.address}`)
    //NOTE: do not call verify function when working with localnetwork (hardhat) chainId: 31337
    if (network.config.chainId == 4 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations")
        await simpleStorage.deployTransaction.wait(6) //wait 6 blocks - best practice
        await verify(simpleStorage.address, [])
    }

    //interact with the contract
    const currentValue = await simpleStorage.retrieve() //get current value
    console.log(`Current Value is: ${currentValue}`)

    //update the current value
    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1) //wait 1 block
    const updatedValue = await simpleStorage.retrieve()
    console.log(`Updated value is: ${updatedValue}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArgurments: args,
        })
    } catch (e) {
        //any error that this section throws
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

//main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
