//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

// All the funtions are internal in library
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    // 20051300000000000000000
    function getDecimal(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint8) {
        return priceFeed.decimals();
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethPriceInUSD = (ethAmount * ethPrice) / 1e18;
        return ethPriceInUSD;
    }

    function version() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }
}
