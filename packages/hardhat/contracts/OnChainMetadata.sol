// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OnChainMetadata
 * @notice Handles on-chain SVG generation and metadata formatting for LSP8Loogies
 * @dev Provides SVG generation with matrix style animation and properly formatted LSP4 metadata
 */
contract OnChainMetadata {
    using Strings for uint256;

    /**
     * @notice Converts a bytes3 color to hex string without 0x prefix
     * @param _color The color as bytes3
     * @return string The hex string of the color
     */
    function toColorHexString(bytes3 _color) public pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(6);
        
        // Extract individual bytes
        for (uint256 i = 0; i < 3; i++) {
            uint8 byteValue = uint8(_color[i]);
            // Process each byte into two hex characters
            result[i*2] = hexChars[uint8(byteValue >> 4)];
            result[i*2 + 1] = hexChars[uint8(byteValue & 0x0f)];
        }
        
        return string(result);
    }

    /**
     * @notice Convert uint to string
     * @param _i The uint to convert
     * @return _uintAsString The string representation
     */
    function uint2str(uint _i) public pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Convert address to string
     * @param _addr The address to convert
     * @return string The string representation
     */
    function addressToString(address _addr) public pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(_addr);
        bytes memory stringBytes = new bytes(42);
        
        stringBytes[0] = '0';
        stringBytes[1] = 'x';
        
        for (uint256 i = 0; i < 20; i++) {
            bytes1 leftNibble = bytes1(uint8(uint8(addressBytes[i]) >> 4));
            bytes1 rightNibble = bytes1(uint8(uint8(addressBytes[i]) & 0x0f));
            
            stringBytes[2 + i*2] = toHexChar(leftNibble);
            stringBytes[2 + i*2 + 1] = toHexChar(rightNibble);
        }
        
        return string(stringBytes);
    }
    
    /**
     * @notice Convert bytes32 to string
     * @param _bytes The bytes32 to convert
     * @return string The string representation
     */
    function bytes32ToString(bytes32 _bytes) public pure returns (string memory) {
        bytes memory bytesArray = new bytes(66);
        bytesArray[0] = '0';
        bytesArray[1] = 'x';
        
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[2 + i*2] = toHexChar(bytes1(uint8(uint8(_bytes[i]) >> 4)));
            bytesArray[2 + i*2 + 1] = toHexChar(bytes1(uint8(uint8(_bytes[i]) & 0x0f)));
        }
        
        return string(bytesArray);
    }
    
    /**
     * @notice Helper to convert a nibble to its hex character
     * @param _nibble The nibble to convert
     * @return char The hex character
     */
    function toHexChar(bytes1 _nibble) internal pure returns (bytes1 char) {
        if (uint8(_nibble) < 10) {
            return bytes1(uint8(_nibble) + 0x30);
        } else {
            return bytes1(uint8(_nibble) + 0x57);
        }
    }

    /**
     * @notice Generate Matrix rain effect SVG based on tokenId
     * @param tokenId The token ID to use for randomization
     * @return string The SVG string for matrix effect
     */
    function generateMatrixRainEffect(bytes32 tokenId) public pure returns (string memory) {
        // Generate pseudo-random characters for matrix effect based on tokenId
        bytes32 predictableRandom = keccak256(abi.encodePacked(tokenId, "matrix"));
        string memory matrixElements = "";
        
        // Generate 200 matrix "drops" with characters (for more density)
        for (uint8 i = 0; i < 200; i++) {
            // Create some clustering by dividing the space into sections
            uint8 section = i / 15; // 4 sections (0-14, 15-29, 30-44, 45-59)
            uint16 sectionWidth = 100; // Each section is 100px wide
            
            // Use different parts of the predictableRandom hash to place characters
            // For x coordinate, cluster within the section with some randomness
            uint16 x = (section * sectionWidth) + (uint16(uint8(predictableRandom[i % 32])) % sectionWidth);
            
            // For y coordinate, distribute more evenly
            uint16 y = 20 + (uint16(uint8(predictableRandom[(i+1) % 32])) % 360);
            
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
            
            // Create animation styles with different falling speeds
            uint8 animationGroup = i % 4; // Split into 4 groups for different effects
            string memory animationStyle;
            
            if (animationGroup == 0) {
                // Very slow fall
                animationStyle = string(abi.encodePacked(
                    "font-size:", uint2str(uint256(fontSize)), "px; animation: fade 4s infinite, fall 18s linear infinite;"
                ));
            } else if (animationGroup == 1) {
                // Slow fall speed
                animationStyle = string(abi.encodePacked(
                    "font-size:", uint2str(uint256(fontSize)), "px; animation: fade 4s infinite, fall 12s linear infinite;"
                ));
            } else if (animationGroup == 2) {
                // Medium fall speed
                animationStyle = string(abi.encodePacked(
                    "font-size:", uint2str(uint256(fontSize)), "px; animation: fade 4s infinite, fall 9s linear infinite;"
                ));
            } else {
                // Slightly faster fall speed
                animationStyle = string(abi.encodePacked(
                    "font-size:", uint2str(uint256(fontSize)), "px; animation: fade 4s infinite, fall 7s linear infinite;"
                ));
            }
            
            matrixElements = string(abi.encodePacked(
                matrixElements,
                '<text x="', uint2str(uint256(x)), '" y="', uint2str(uint256(y)), 
                '" class="matrix-char" style="', animationStyle, '">',
                character,
                '</text>'
            ));
        }
        
        return matrixElements;
    }

    /**
     * @notice Generate SVG for a Loogie
     * @param color Color of the Loogie
     * @param chubbiness Chubbiness value
     * @param mouthLength Mouth length value
     * @param username Username
     * @param isUP Whether the owner is a Universal Profile
     * @param matrixSeed Seed for the matrix animation
     * @return string The SVG string
     */
    function generateLoogieSVG(
        bytes3 color,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username,
        bool isUP,
        bytes32 matrixSeed
    ) public pure returns (string memory) {
        string memory matrixEffect = generateMatrixRainEffect(matrixSeed);
        
        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                // Add the Comic Sans font definition to the SVG
                '<defs>',
                '<style>',
                '@font-face {',
                'font-family: "Comic Sans MS";',
                'src: url("https://fonts.cdnfonts.com/css/comic-sans");',
                '}',
                '.username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; }',
                '.matrix-char { font-family: monospace; fill: ', 
                isUP ? "#FF00FF" : "#0F0", 
                '; opacity: 0.8; }',
                '@keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }',
                '@keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }',
                '</style>',
                '</defs>',
                // Add a semi-transparent black background rectangle
                '<rect width="400" height="400" fill="rgba(0,0,0,0.85)" />',
                // Matrix rain effect background using SVG elements
                '<g class="matrix-background">',
                matrixEffect,
                '</g>',
                // Add a slightly transparent background for the Loogie to make it stand out
                '<g class="loogie-container">',
                '<ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)" filter="blur(20px)" />',
                // Render the Loogie
                renderLoogie(color, chubbiness, mouthLength, username, isUP),
                '</g>',
                "</svg>"
            )
        );
        return svg;
    }
    
    /**
     * @notice Render the Loogie SVG
     * @param color Color of the Loogie
     * @param chubbiness Chubbiness value
     * @param mouthLength Mouth length value
     * @param username Username
     * @param isUP Whether the owner is a Universal Profile
     * @return string The SVG part for the Loogie
     */
    function renderLoogie(
        bytes3 color,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username,
        bool isUP
    ) internal pure returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<g id="eye1">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>',
                "</g>",
                '<g id="head">',
                '<ellipse fill="#',
                toColorHexString(color),
                '" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="',
                uint2str(chubbiness),
                '" ry="51.80065" stroke="#000"/>',
                "</g>",
                '<g id="eye2">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>',
                "</g>",
                '<g class="mouth" transform="translate(',
                uint2str(uint256((810 - 9 * uint256(chubbiness)) / 11)),
                ',0)">',
                '<path d="M 130 240 Q 165 250 ',
                uint2str(mouthLength),
                ' 235" stroke="black" stroke-width="3" fill="transparent"/>',
                "</g>",
                // Move the UP username a bit lower (from y=275 to y=290)
                '<text x="200" y="290" text-anchor="middle" class="username" fill="white" stroke="black" stroke-width="0.5">',
                username,
                '</text>'
            )
        );
        return render;
    }
    
    /**
     * @notice Create token metadata following LSP4 standard format
     * @param tokenId The token ID
     * @param color Color of the Loogie
     * @param chubbiness Chubbiness value
     * @param mouthLength Mouth length value
     * @param username Username
     * @param isUP Whether the owner is a Universal Profile
     * @param contractAddress Contract address for asset link
     * @return raw Raw metadata bytes
     * @return encoded Base64 encoded metadata with data URI
     */
    function createTokenMetadata(
        bytes32 tokenId,
        bytes3 color,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username,
        bool isUP,
        address contractAddress
    ) public pure returns (bytes memory raw, bytes memory encoded) {
        // Generate SVG
        string memory svgImage = generateLoogieSVG(
            color,
            chubbiness,
            mouthLength,
            username,
            isUP,
            keccak256(abi.encodePacked(tokenId, "matrix"))
        );
        
        // Create metadata JSON
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                toColorHexString(color),
                " with a chubbiness of ",
                uint2str(chubbiness),
                " and mouth length of ",
                uint2str(mouthLength),
                "!!!"
            )
        );
        
        // Calculate the hash of the SVG for verification
        bytes32 svgHash = keccak256(bytes(svgImage));
        
        // Create the raw metadata with proper LSP4 structure - following the LUKSO standard
        raw = abi.encodePacked(
            '{"LSP4Metadata":{"name":"',
            tokenName,
            '","description":"',
            description,
            '","links":[{"title":"Website","url":"https://luksoloogies.vercel.app"},{"title":"View Token","url":"https://universaleverything.io/asset/',
            addressToString(contractAddress),
            '/tokenId/',
            bytes32ToString(tokenId),
            '?network=testnet"}],"images":[[{"width":400,"height":400,"url":"data:image/svg+xml;base64,',
            Base64.encode(bytes(svgImage)),
            '","verification":{"method":"keccak256(bytes)","data":"',
            bytes32ToString(svgHash),
            '"}}]],"attributes":[{"key":"color","value":"#',
            toColorHexString(color),
            '","type":"string"},{"key":"chubbiness","value":"',
            uint2str(chubbiness),
            '","type":"number"},{"key":"mouthLength","value":"',
            uint2str(mouthLength),
            '","type":"number"},{"key":"upUsername","value":"',
            username,
            '","type":"string"}]}}'
        );
        
        // Create the encoded version (with data URI prefix)
        encoded = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(raw)
        );
        
        return (raw, encoded);
    }
    
    /**
     * @notice Create collection metadata following LSP4 standard format
     * @return raw Raw metadata bytes
     * @return encoded Base64 encoded metadata with data URI
     */
    function createCollectionMetadata() public pure returns (bytes memory raw, bytes memory encoded) {
        // Create a simple collection logo SVG
        string memory collectionSvg = '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#000"/><text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">LuksoLoogies</text><text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle">Matrix Edition</text></svg>';
        
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
            '"assets":[],"attributes":[{"key":"type","value":"collection","type":"string"},{"key":"style","value":"matrix","type":"string"}]}}'
        );
        
        // Create the encoded version (with data URI prefix)
        encoded = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(raw)
        );
        
        return (raw, encoded);
    }
} 