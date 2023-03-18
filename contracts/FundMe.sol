// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;
import "./PriceConverter.sol";

error FundMe__NotOwner();

//Smart contarcts can also hold funds just like the wallet.
//Since everytime we deploy a contract they get a contract address and its nearly the same as wallet address.
// So both wallet and contract can hold native blockchain token like Etherium
/**
 * @title A contract for funding
 * @author Praveen Sheoran
 * @notice A demo
 * @dev This implements price feeds for our library
 */
contract FundMe {
    //type declarations
    uint256 public number;
    uint256 public minimumUsd = 50 * 10 ** 18;

    // state variables
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    using PriceConverter for uint256; // Using as Library
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // This function for people to send money to
    function fund() public payable {
        // Want to be able to set a minimum amount in USD.
        // 1. How do we send ETH to this contract?
        // msg - a global variable

        // require is checker which check values if does not meet the criteria it will revret.
        // What is reverting - Undo any action before, and send the remaining gas.
        // number = 5;
        // Lets say if we call this fund method with ether less than 1, then it will revert.
        // So did we spend any gas? Yes we did. We spend the gas on assiging the value to number = 5.
        // But it will return all the gas after this require
        // require(
        //     msg.value.getConversionRate(s_priceFeed) >= minimumUsd,
        //     "Didn't send enough!"
        // ); // 1e18 == 1 * 10 ** 18 = 1000000000000000000
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);

        //Send ether or withdraw ether
        //transfer
        // msg.sender = address type
        // payable(msg.sender) = payable type
        //Problem with transfer funtion that it is capped at 2300 gas and it will throw an error
        //payable(msg.sender).transfer(address(this).balance);
        //Send
        // 2300 gas cap but wont throw an error will return a bool
        //  bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        //Call
        // we can use it call any function in all of the etherum
        // No capped gas and returns boolean and bytes data
        // (bool callSuceess, ) = payable(msg.sender).call{
        //     value: address(this).balance
        // }("");
        // require(callSuceess, "Call failed");
    }

    // This function is for the i_owner of this contract to withdraw money that different s_funders gives us.
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // Transfer vs call vs Send
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
