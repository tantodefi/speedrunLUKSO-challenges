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

contract LSP8LoogiesUpdated is LSP8IdentifiableDigitalAsset {
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
        
        // Set collection supply data explicitly with correct LUKSO metadata keys
        bytes32 LSP4_METADATA_TOTAL_SUPPLY = 0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f;
        _setData(LSP4_METADATA_TOTAL_SUPPLY, bytes.concat(bytes32(uint256(limit))));
        
        bytes32 LSP4_METADATA_MAX_SUPPLY = 0xd28c95357cf4c94d638a4f572d5d3df8d7e1415c8b650e747a219c559d1435c8;
        _setData(LSP4_METADATA_MAX_SUPPLY, bytes.concat(bytes32(uint256(limit))));
        
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

    // Add utility functions for SVG generation
    function addressToString(address addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(addr);
        bytes memory hexChars = "0123456789abcdef";
        bytes memory stringBytes = new bytes(42);
        
        stringBytes[0] = '0';
        stringBytes[1] = 'x';
        
        for (uint256 i = 0; i < 20; i++) {
            uint8 byteValue = uint8(addressBytes[i]);
            stringBytes[2 + i*2] = hexChars[byteValue >> 4];
            stringBytes[2 + i*2 + 1] = hexChars[byteValue & 0x0f];
        }
        
        return string(stringBytes);
    }
    
    function bytes32ToString(bytes32 value) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory stringBytes = new bytes(66);
        
        stringBytes[0] = '0';
        stringBytes[1] = 'x';
        
        for (uint256 i = 0; i < 32; i++) {
            uint8 byteValue = uint8(value[i]);
            stringBytes[2 + i*2] = hexChars[byteValue >> 4];
            stringBytes[2 + i*2 + 1] = hexChars[byteValue & 0x0f];
        }
        
        return string(stringBytes);
    }
    
    function uint2str(uint value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint temp = value;
        uint digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    function toColorHexString(bytes3 colorBytes) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory buffer = new bytes(6);
        
        for (uint i = 0; i < 3; i++) {
            buffer[i*2] = hexChars[uint8(colorBytes[i]) >> 4];
            buffer[i*2 + 1] = hexChars[uint8(colorBytes[i]) & 0x0f];
        }
        
        return string(buffer);
    }

    // Create collection metadata following LSP4 standard format
    function createCollectionMetadata() internal pure returns (bytes memory raw, bytes memory encoded) {
        // Create a simple collection logo SVG - use a more basic SVG format for better compatibility
        string memory collectionSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#000"/><text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">LuksoLoogies</text><text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle">Matrix Edition</text></svg>';
        
        // Calculate the hash of the SVG for verification
        bytes32 svgHash = keccak256(bytes(collectionSvg));
        
        // Create the collection metadata with proper LSP4 structure - following the LUKSO standard
        raw = abi.encodePacked(
            '{"LSP4Metadata":{"name":"LuksoLoogies","description":"LuksoLoogies are LUKSO Standard LSP8 NFTs with a smile :) Only 3728 LuksoLoogies available on a price curve increasing 0.2% with each new mint. This Matrix Edition features animated Matrix-style falling code behind each Loogie.",',
            '"links":[{"title":"Website","url":"https://luksoloogies.vercel.app"},{"title":"Twitter","url":"https://twitter.com/luksoLoogies"}],',
            '"images":[[{"width":400,"height":400,"url":"data:image/svg+xml;base64,',
            Base64.encode(bytes(collectionSvg)),
            '","verification":{"method":"keccak256(bytes)","data":"',
            bytes32ToString(svgHash),
            '"}}]],',
            '"assets":[],',
            '"icon":[{"width":400,"height":400,"url":"data:image/svg+xml;base64,',
            Base64.encode(bytes(collectionSvg)),
            '","verification":{"method":"keccak256(bytes)","data":"',
            bytes32ToString(svgHash),
            '"}}]}}' // No attributes in collection metadata to avoid collection/token confusion
        );
        
        // Create the encoded version (with data URI prefix)
        encoded = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(raw)
        );
        
        return (raw, encoded);
    }
    
    // Generate a complete Loogie SVG with simplified Matrix rain background
    // This version works with both Universal Explorer (static) and local previews (animated)
    function generateLoogieSVG(
        bytes3 colorValue,
        uint256 chubbinessValue,
        uint256 mouthLengthValue,
        string memory username,
        bool isUP,
        bytes32 matrixSeed
    ) internal pure returns (string memory) {
        // Generate matrix effect with static positioning
        string memory matrixEffect = generateMatrixRainEffect(matrixSeed);
        string memory matrixColor = isUP ? "#FF00FF" : "#0F0"; // Purple for UPs, green for regular addresses
        
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
                // Add style definitions - Universal Explorer may filter out animations but will preserve classes
                '<style>',
                '.matrix-char{font-family:monospace;fill:', matrixColor, ';opacity:0.8;}',
                '.username{font-family:sans-serif;font-size:16px;fill:white;}',
                '</style>',
                // Add a black background rectangle
                '<rect width="400" height="400" fill="#000"/>',
                // Matrix characters - static positioning, but with animation class
                '<g class="matrix-background">',
                matrixEffect,
                '</g>',
                // Add background for loogie
                '<ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)"/>',
                // Render the Loogie body
                '<g>',
                // Draw the head
                '<ellipse fill="#', toColorHexString(colorValue), 
                '" stroke="#000" stroke-width="3" cx="204.5" cy="211.8" rx="', 
                uint2str(chubbinessValue), '" ry="51.8"/>',
                // Draw the eyes
                '<ellipse stroke="#000" stroke-width="3" cx="181.5" cy="154.5" rx="29.5" ry="29.5" fill="#fff"/>',
                '<ellipse stroke="#000" stroke-width="3" cx="209.5" cy="168.5" rx="29.5" ry="29.5" fill="#fff"/>',
                '<circle cx="173.5" cy="154.5" r="3.5" fill="#000"/>',
                '<circle cx="208" cy="169.5" r="3.5" fill="#000"/>',
                // Draw the mouth
                '<path d="M 130 240 Q 165 250 ', uint2str(mouthLengthValue), 
                ' 235" stroke="black" stroke-width="3" fill="transparent" transform="translate(',
                uint2str(uint256((810 - 9 * chubbinessValue) / 11)), ',0)"/>',
                // Username text
                '<text x="200" y="290" text-anchor="middle" class="username">', username, '</text>',
                '</g>',
                '</svg>'
            )
        );
        
        return svg;
    }
    
    // Simplified Matrix effect with static positioning - better for Universal Explorer
    function generateMatrixRainEffect(bytes32 seed) internal pure returns (string memory) {
        bytes32 predictableRandom = keccak256(abi.encodePacked(seed));
        string memory matrixElements = "";
        
        // Generate 100 matrix characters with static positioning
        for (uint8 i = 0; i < 100; i++) {
            // Create some clustering by dividing the space into sections
            uint8 section = i / 10; // 10 sections with 10 chars each
            uint16 sectionWidth = 40; // Each section is 40px wide
            
            // Use the predictable random hash to place characters
            uint16 x = (section * sectionWidth) + uint16(uint8(predictableRandom[i % 32]) % sectionWidth);
            uint16 y = 20 + uint16(uint8(predictableRandom[(i+1) % 32]) % 360);
            
            // Select a character from the matrix charset
            uint8 charIndex = uint8(predictableRandom[(i+2) % 32]) % 36; // 0-9, A-Z = 36 chars
            string memory character = "";
            
            if (charIndex < 10) {
                // 0-9
                character = uint2str(uint256(charIndex));
            } else {
                // A-Z
                character = string(abi.encodePacked(bytes1(uint8(charIndex - 10 + 65))));
            }
            
            // Add font size variation for depth effect (9px to 14px)
            uint8 fontSize = 9 + (i % 6);
            
            // Add opacity variation (0.3 to 0.9)
            uint8 opacityValue = 3 + (uint8(predictableRandom[(i+3) % 32]) % 7);
            string memory opacity = string(abi.encodePacked(
                "0.", uint2str(uint256(opacityValue))
            ));
            
            // Create a unique animation delay per character
            uint8 delay = i % 20;
            
            // Add the character as a text element with position and opacity set
            matrixElements = string(abi.encodePacked(
                matrixElements,
                '<text x="', uint2str(uint256(x)), '" y="', uint2str(uint256(y)), 
                '" class="matrix-char" style="font-size:', uint2str(uint256(fontSize)),
                'px;opacity:', opacity, ';">', 
                character,
                '</text>'
            ));
        }
        
        return matrixElements;
    }

    // Use SVG generation function to create a token image
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
        
        // Generate SVG directly inline
        string memory svgImage = generateLoogieSVG(
            color[tokenId],
            chubbiness[tokenId],
            mouthLength[tokenId],
            username,
            isUP,
            keccak256(abi.encodePacked(tokenId, "matrix"))
        );
        
        // Calculate SVG hash for verification
        bytes32 svgHash = keccak256(bytes(svgImage));
        
        // Convert SVG to base64
        string memory base64Svg = Base64.encode(bytes(svgImage));
        
        // Create token name and description
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                toColorHexString(color[tokenId]),
                " with a chubbiness of ",
                uint2str(chubbiness[tokenId]),
                " and mouth length of ",
                uint2str(mouthLength[tokenId]),
                "!!!"
            )
        );
        
        // Get matrix color text for attribute
        string memory matrixColorText = isUP ? "purple" : "green";
        
        // Create properly structured metadata JSON for better compatibility
        bytes memory rawMetadata = bytes(string(abi.encodePacked(
            '{"LSP4Metadata":{"name":"',
            tokenName,
            '","description":"',
            description,
            '","links":[{"title":"Website","url":"https://luksoloogies.vercel.app"}],',
            '"images":[[{"width":400,"height":400,"url":"data:image/svg+xml;base64,',
            base64Svg,
            '","verification":{"method":"keccak256(bytes)","data":"',
            bytes32ToString(svgHash),
            '"}}]],',
            // Use clean attribute names that match the token properties, not collection metadata
            '"attributes":[',
            '{"key":"color","value":"#', toColorHexString(color[tokenId]), '","type":"string"},',
            '{"key":"chubbiness","value":', uint2str(chubbiness[tokenId]), ',"type":"number"},',
            '{"key":"mouthLength","value":', uint2str(mouthLength[tokenId]), ',"type":"number"},',
            '{"key":"username","value":"', username, '","type":"string"},',
            '{"key":"matrixColor","value":"', matrixColorText, '","type":"string"}',
            ']}}'
        )));
        
        // Create the encoded version (with data URI prefix)
        bytes memory encodedMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(rawMetadata)
        );
        
        // Use standard LUKSO verification format
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