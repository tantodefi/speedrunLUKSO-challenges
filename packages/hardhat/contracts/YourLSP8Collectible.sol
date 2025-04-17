// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";

/**
 * @title YourLSP8Collectible
 * @dev LSP8 Token contract for creating unique digital collectibles on LUKSO
 */
contract YourLSP8Collectible is LSP8IdentifiableDigitalAsset {
	// Constructor takes name, symbol, and owner address
	constructor(
		string memory name,
		string memory symbol,
		address contractOwner
	)
		LSP8IdentifiableDigitalAsset(
			name,
			symbol,
			contractOwner,
			0, // Using Number format (0) for tokenID
			0 // Not supplying additional interface IDs
		)
	{
		// Additional initialization if needed
	}

	// Function to mint new tokens
	function mint(address to, bytes32 tokenId) public onlyOwner {
		_mint(to, tokenId, true, "");
	}

	// Function to burn tokens
	function burn(bytes32 tokenId) public {
		address tokenOwner = tokenOwnerOf(tokenId);
		require(tokenOwner == _msgSender(), "LSP8: caller is not token owner");
		_burn(tokenId, "");
	}
}

