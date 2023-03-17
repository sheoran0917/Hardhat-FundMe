const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let deployer
          let fundMe
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer // Get the acccounts or signers
              await deployments.fixture(["all"]) // Deploy the contracts
              fundMe = await ethers.getContract("FundMe", deployer) // Get fund me contarct using name and signer or account
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              ) // get the mockV3Aggregator contract
          })
          describe("constructor", async () => {
              it("Set the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", () => {
              it("Test if no funds send is failing", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!"
                  )
              })
              it("Test if datastructure is getting updated", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(sendValue.toString(), response.toString())
              })

              it("adds funders to funder array", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", () => {
              it("Check if owner can withdraw the funds", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  await fundMe.withdraw()
                  assert.equal(response, deployer)
              })
          })
          describe("Withdraw with exact match test", () => {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("Withdraw eth from single founder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionRecipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("Only Onwner test", async () => {
                  const account = await ethers.getSigners()
                  const funcMeConnctedContract = await fundMe.connect(
                      account[1]
                  )
                  await expect(funcMeConnctedContract.withdraw()).to.be.reverted
              })
              it("Multiple fund withdraw", async () => {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionRecipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  // Make sure funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
