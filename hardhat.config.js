const { version } = require("chai")

require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("dotenv").config()

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth.sepolia/example"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "Key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Key"
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "https://eth.sepolia/example"
const LOCAL_PRIVATE_KEY = process.env.LOCAL_PRIVATE_KEY || "Key"
const COIN_MARKET_KEY = process.env.COIN_MARKET_API_KEY || "Key"
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.18" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: LOCAL_RPC_URL,
            // accounts: [LOCAL_PRIVATE_KEY], - We do not need accounts as hardhat will automatically provide for us
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        outputFile: "gasreporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_KEY,
        // token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}
