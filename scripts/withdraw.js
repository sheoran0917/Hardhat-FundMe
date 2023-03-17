const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log(
        `Withdraw transaction initaited from ${deployer} to address ${fundMe.address}`
    )
    console.log(
        `Current balance of deployer is ${(
            await fundMe.provider.getBalance(deployer)
        ).toString()} and current balance of Fund Me contract is ${(
            await fundMe.getAddressToAmountFunded(deployer)
        ).toString()}`
    )
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log(
        `Updated balance of deployer is ${(
            await fundMe.provider.getBalance(deployer)
        ).toString()} and Updated balance of Fund Me contract is ${(
            await fundMe.getAddressToAmountFunded(deployer)
        ).toString()}`
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
