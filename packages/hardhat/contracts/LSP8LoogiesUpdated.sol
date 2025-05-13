// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";
import "./ILSP0ERC725Account.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./ILSP3Profile.sol";
import "./LSP4Constants.sol";
import "./OnChainMetadata.sol";

contract LSP8LoogiesUpdated is LSP8IdentifiableDigitalAsset, OnChainMetadata {
    using Strings for uint256;
    using Strings for uint8;

    uint256 private _tokenIds;
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;
    // Store existing token IDs to check existence at runtime
    mapping(uint256 => bool) private _tokenIdExists;
    // Store UP usernames for each token
    mapping(bytes32 => string) public upUsernames;

    // all funds go to buidlguidl.eth
    address payable public constant recipient =
        payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);

    uint256 public constant limit = 3728;
    uint256 public constant curve = 1002; // price increase 0.2% with each purchase
    uint256 public price = 0.1 ether; // LYX is at $1

    // LSP0 Universal Receiver interface ID to detect Universal Profiles
    bytes4 constant _INTERFACEID_LSP0 = 0x3a271fff;
    
    constructor(address contractOwner) 
    LSP8IdentifiableDigitalAsset(
        "LuksoLoogies", 
        "LUKLOOG", 
        contractOwner, 
        _LSP4_TOKEN_TYPE_COLLECTION, // Set to COLLECTION (2) instead of NFT (1)
        0 // Token ID format number (0)
    ) {
        // Set additional data for proper indexing
        _setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);
        
        // Initialize collection metadata
        _updateCollectionMetadata();
    }

    // Add standard name() function for compatibility with ERC721 display
    function name() public view returns (string memory) {
        return string(getData(_LSP4_TOKEN_NAME_KEY));
    }

    // Add standard symbol() function for compatibility with ERC721 display
    function symbol() public view returns (string memory) {
        return string(getData(_LSP4_TOKEN_SYMBOL_KEY));
    }

    // Add totalSupply() function for compatibility with ERC721
    function totalSupply() public view override returns (uint256) {
        return _tokenIds;
    }

    function mintItem() public payable returns (bytes32) {
        require(_tokenIds < limit, "DONE MINTING");
        require(msg.value >= price, "NOT ENOUGH");

        price = (price * curve) / 1000;

        _tokenIds += 1;
        // Convert to bytes32 in a way that ensures sequential ID format
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        _tokenIdExists[_tokenIds] = true;

        bytes32 predictableRandom = keccak256(
            abi.encodePacked(
                tokenId,
                blockhash(block.number - 1),
                msg.sender,
                address(this)
            )
        );
        color[tokenId] =
            bytes2(predictableRandom[0]) |
            (bytes2(predictableRandom[1]) >> 8) |
            (bytes3(predictableRandom[2]) >> 16);
        chubbiness[tokenId] =
            35 + ((55 * uint256(uint8(predictableRandom[3]))) / 255);
        mouthLength[tokenId] =
            180 + ((uint256(chubbiness[tokenId] / 4) * uint256(uint8(predictableRandom[4]))) / 255);

        // Set default UP username
        upUsernames[tokenId] = "luksonaut";

        // Mint the token
        _mint(msg.sender, tokenId, true, "");

        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");

        return tokenId;
    }

    // Keeping the original mintLoogie for backwards compatibility
    function mintLoogie(address to) public returns (bytes32) {
        _tokenIds += 1;
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        _tokenIdExists[_tokenIds] = true;

        bytes32 predictableRandom = keccak256(
            abi.encodePacked(
                tokenId,
                blockhash(block.number - 1),
                to,
                address(this)
            )
        );
        color[tokenId] =
            bytes2(predictableRandom[0]) |
            (bytes2(predictableRandom[1]) >> 8) |
            (bytes3(predictableRandom[2]) >> 16);
        chubbiness[tokenId] =
            35 + ((55 * uint256(uint8(predictableRandom[3]))) / 255);
        mouthLength[tokenId] =
            180 + ((uint256(chubbiness[tokenId] / 4) * uint256(uint8(predictableRandom[4]))) / 255);

        // Set default UP username
        upUsernames[tokenId] = "luksonaut";

        // Mint the token
        _mint(to, tokenId, true, "");
        
        return tokenId;
    }

    // Add function to set UP username for a token
    function setUPUsername(bytes32 tokenId, string memory username) public {
        address tokenOwner = tokenOwnerOf(tokenId);
        require(tokenOwner == msg.sender || isUniversalProfile(tokenOwner), "LSP8: Not authorized");
        upUsernames[tokenId] = username;
    }

    // Helper function to check if a token exists by its uint256 ID
    function tokenExists(uint256 id) public view returns (bool) {
        return _tokenIdExists[id];
    }
    
    // Check if an address is likely a Universal Profile
    function isUniversalProfile(address account) public view returns (bool) {
        // Using a try-catch because the call might revert on non-contract addresses
        try IERC165(account).supportsInterface(_INTERFACEID_LSP0) returns (bool supportsLSP0) {
            if (supportsLSP0) {
                try IERC165(account).supportsInterface(_INTERFACEID_LSP1) returns (bool supportsLSP1) {
                    return supportsLSP1; // If it supports both LSP0 and LSP1, it's likely a UP
                } catch {
                    return false;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    // Override supportsInterface to support both LSP8 standard interface IDs
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return 
            interfaceId == _INTERFACEID_LSP8 || // New LSP8 interface ID
            super.supportsInterface(interfaceId);
    }

    // Use OnChainMetadata to generate SVG for a token
    function generateSVGofTokenById(bytes32 tokenId) internal view returns (string memory) {
        string memory username = upUsernames[tokenId];
        bool isUP = isUniversalProfile(tokenOwnerOf(tokenId));
        
        // Generate the SVG
        return generateLoogieSVG(
            color[tokenId],
            chubbiness[tokenId],
            mouthLength[tokenId],
            username,
            isUP,
            keccak256(abi.encodePacked(tokenId, "matrix"))
        );
    }

    // Override _getDataForTokenId to return token-specific metadata in LSP4 format
    // Update to follow the pattern from Beans.sol
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual override returns (bytes memory dataValues) {
        // Only override for LSP4 metadata key
        if (dataKey != _LSP4_METADATA_KEY) {
            return super._getDataForTokenId(tokenId, dataKey);
        }
        
        // Get token owner for UP check
        address owner = tokenOwnerOf(tokenId);
        bool isUP = isUniversalProfile(owner);
        string memory username = upUsernames[tokenId];
        
        // Create proper LSP4 metadata for this token
        (bytes memory rawMetadata, bytes memory encodedMetadata) = createTokenMetadata(
            tokenId,
            color[tokenId],
            chubbiness[tokenId],
            mouthLength[tokenId],
            username,
            isUP,
            address(this)
        );
        
        // Following Beans.sol pattern, construct the verifiable URI with specific format
        // Using the standard LUKSO verification prefix (0x00006f357c6a0020)
        bytes memory verifiableURI = bytes.concat(
            hex"00006f357c6a0020",
            keccak256(rawMetadata),
            encodedMetadata
        );
        
        return verifiableURI;
    }
    
    // Update collection metadata with proper LSP4 format
    function updateCollectionMetadata() public {
        require(msg.sender == owner(), "LSP8: Not authorized");
        _updateCollectionMetadata();
    }
    
    // Internal function to update collection metadata following Beans.sol pattern
    function _updateCollectionMetadata() internal {
        // Create properly formatted collection metadata
        (bytes memory rawMetadata, bytes memory encodedMetadata) = createCollectionMetadata();
        
        // Set collection metadata using the LUKSO verification format
        _setData(_LSP4_METADATA_KEY, bytes.concat(
            hex"00006f357c6a0020",
            keccak256(rawMetadata),
            encodedMetadata
        ));
    }
} 