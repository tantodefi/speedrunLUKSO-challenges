// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title MockRegularContract
 * @dev A simplified mock of a regular contract that implements ERC165 but NOT the LSP interfaces.
 * Used for testing UP detection in LSP8Loogies.
 */
contract MockRegularContract is ERC165 {
    // This contract only implements ERC165, but not LSP0 or LSP1

    // Dummy functions to receive ETH
    receive() external payable {}
    fallback() external payable {}
} 