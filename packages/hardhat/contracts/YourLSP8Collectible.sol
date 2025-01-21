// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title YourLSP8Collectible
 * @dev LSP8 Token contract for creating unique digital collectibles on LUKSO
 */
contract YourLSP8Collectible is LSP8IdentifiableDigitalAsset, LSP8Mintable, LSP8Burnable {
    using Strings for uint256;

    // Token name counter
    uint256 private _tokenIds;

    // Mapping for token URIs
    mapping(bytes32 => string) private _tokenURIs;

    constructor(
        string memory name,
        string memory symbol,
        address contractOwner
    ) LSP8IdentifiableDigitalAsset(name, symbol, contractOwner, LSP8_TOKENID_FORMAT_NUMBER) {
        // Constructor initialization
    }

    // Function to mint new tokens with metadata
    function mintItem(address to, string memory tokenURI) public returns (bytes32) {
        _tokenIds += 1;
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        
        // Store the tokenURI
        _tokenURIs[tokenId] = tokenURI;
        
        // Mint the token
        _mint(to, tokenId, true, "");
        
        return tokenId;
    }

    // Function to get token URI
    function tokenURI(bytes32 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "LSP8: Token does not exist");
        return _tokenURIs[tokenId];
    }

    // Function to check if a token exists
    function _exists(bytes32 tokenId) internal view returns (bool) {
        return tokenOwnerOf(tokenId) != address(0);
    }

    // Function to burn tokens
    function burn(bytes32 tokenId) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "LSP8: Caller is not owner nor approved");
        _burn(tokenId);
        delete _tokenURIs[tokenId];
    }

    // Function to check if an address is the owner or approved
    function _isApprovedOrOwner(address spender, bytes32 tokenId) internal view returns (bool) {
        address owner = tokenOwnerOf(tokenId);
        return (spender == owner || isOperatorFor(spender, tokenId));
    }

    // Optional: Add support for token metadata updates
    function setTokenURI(bytes32 tokenId, string memory newTokenURI) public {
        require(_exists(tokenId), "LSP8: URI set of nonexistent token");
        require(_isApprovedOrOwner(msg.sender, tokenId), "LSP8: Caller is not owner nor approved");
        _tokenURIs[tokenId] = newTokenURI;
    }
}