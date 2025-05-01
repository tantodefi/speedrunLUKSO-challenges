// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";

/**
 * @title YourLSP7Token
 * @dev Fully LSP7-compliant token using official LUKSO implementation
 */
contract YourLSP7Token is LSP7DigitalAsset {
    constructor(string memory name, string memory symbol, address newOwner)
        LSP7DigitalAsset(name, symbol, newOwner, 0, false) // 0 = Token, false = divisible (fungible)
    {}

    // Public mint function for deployment/testing
    function mint(address to, uint256 amount, bool force, bytes memory data) public {
        _mint(to, amount, force, data);
    }
}