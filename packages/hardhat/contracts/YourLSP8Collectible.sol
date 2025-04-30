// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";

/**
 * @title YourLSP8Collectible
 * @dev LSP8 Token contract for creating unique digital collectibles on LUKSO
 */
contract YourLSP8Collectible is LSP8IdentifiableDigitalAsset {
    // Track all minted tokenIds
    bytes32[] private _allTokenIds;

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

    // Function to mint new tokens with metadata URI (LUKSO way)
    function mint(address to, bytes32 tokenId, string memory metadataURI) public {
        _mint(to, tokenId, true, "");
        // Prevent duplicate tokenIds
        bool exists = false;
        for (uint256 i = 0; i < _allTokenIds.length; i++) {
            if (_allTokenIds[i] == tokenId) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            _allTokenIds.push(tokenId);
        }
        // Save metadata URI using ERC725Y data key
        setTokenMetadata(tokenId, metadataURI);
    }

    // Store metadata URI using ERC725Y key-value storage
    function setTokenMetadata(bytes32 tokenId, string memory metadataURI) public {
        bytes32 key = keccak256(abi.encodePacked("LSP8MetadataJSON:", tokenId));
        _setData(key, bytes(metadataURI));
    }

    // Retrieve metadata URI for a token
    function getTokenMetadata(bytes32 tokenId) public view returns (string memory) {
        bytes32 key = keccak256(abi.encodePacked("LSP8MetadataJSON:", tokenId));
        bytes memory value = _getData(key);
        return string(value);
    }

    // Function to burn tokens
    function burn(bytes32 tokenId) public {
        address tokenOwner = tokenOwnerOf(tokenId);
        require(tokenOwner == _msgSender(), "LSP8: caller is not token owner");
        _burn(tokenId, "");
        // Optionally remove from _allTokenIds (gas heavy, not recommended for large sets)
    }

    // Public view function to return all tokenIds
    function allTokenIds() public view returns (bytes32[] memory) {
        return _allTokenIds;
    }
}


