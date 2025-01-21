// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Import LSP7 base contract and interfaces
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol";

/**
 * @title YourLSP7Token
 * @dev LSP7 Token contract for creating fungible tokens on LUKSO
 */
contract YourLSP7Token is LSP7DigitalAsset, LSP7Mintable, LSP7Burnable {
    // Constructor takes name, symbol, and owner address
    constructor(
        string memory name,
        string memory symbol,
        address contractOwner
    ) LSP7DigitalAsset(name, symbol, contractOwner, true) {
        // Mint initial supply to contract owner
        // 1000 tokens with 18 decimals
        _mint(contractOwner, 1000 * 10**18, true, "");
    }

    // Function to mint new tokens (only owner can call this)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount, true, "");
    }

    // Function to burn tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount, "");
    }
}
