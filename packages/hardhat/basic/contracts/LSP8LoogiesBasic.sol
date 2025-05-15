// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title LSP8LoogiesBasic
 * @dev LSP8 Token contract for creating unique Loogie collectibles on LUKSO
 * The SVG generation follows the same logic as the original YourCollectible contract
 * but implements proper LSP8 compliance and metadata standards.
 */
contract LSP8LoogiesBasic is LSP8IdentifiableDigitalAsset {
    using Strings for uint256;

    // Constants for token limits and pricing
    uint256 public constant LIMIT = 3728;
    uint256 public price = 0.001 ether;

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    // Mappings for token attributes
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;

    // LSP4 Metadata key
    bytes32 private constant _LSP4_METADATA_KEY = 0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e;

    // Constants for LSP8 token ID format (using the number format)
    uint256 private constant _LSP8_TOKENID_FORMAT_NUMBER = 0;

    constructor(string memory name, string memory symbol) 
        LSP8IdentifiableDigitalAsset(
            name, 
            symbol, 
            msg.sender,
            1,  // LSP4 Token Type = NFT
            _LSP8_TOKENID_FORMAT_NUMBER
        )
    {
        // Constructor initialization
    }

    /**
     * @notice Mint a new Loogie token
     * @return tokenId The ID of the minted token
     */
    function mintItem() public payable returns (bytes32) {
        require(_tokenIdCounter < LIMIT, "DONE MINTING");
        require(msg.value >= price, "NOT ENOUGH");

        _tokenIdCounter++;

        // Create token ID from counter
        bytes32 tokenId = bytes32(uint256(_tokenIdCounter));

        // Generate random attributes based on token ID
        bytes32 predictableRandom = keccak256(
            abi.encodePacked(
                tokenId,
                blockhash(block.number - 1),
                msg.sender,
                address(this)
            )
        );

        // Set token attributes
        color[tokenId] = bytes2(predictableRandom[0]) |
                        (bytes2(predictableRandom[1]) >> 8) |
                        (bytes3(predictableRandom[2]) >> 16);
        
        chubbiness[tokenId] = 35 + ((55 * uint256(uint8(predictableRandom[3]))) / 255);
        
        // small chubbiness loogies have small mouth
        mouthLength[tokenId] = 180 + ((uint256(chubbiness[tokenId] / 4) * 
                            uint256(uint8(predictableRandom[4]))) / 255);

        // Mint the token
        _mint(msg.sender, tokenId, true, "");

        return tokenId;
    }

    /**
     * @notice Withdraw contract funds to the owner
     */
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Generate SVG for a token by ID
     * @param tokenId The token ID
     * @return svg The SVG string representation
     */
    function generateSVGofTokenById(bytes32 tokenId) internal view returns (string memory svg) {
        return string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                renderTokenById(tokenId),
                '</svg>'
            )
        );
    }

    /**
     * @notice Render the specific token SVG elements
     * @param tokenId The token ID
     * @return render The SVG inner content
     */
    function renderTokenById(bytes32 tokenId) public view returns (string memory render) {
        bytes3 tokenColor = color[tokenId];
        uint256 tokenChubbiness = chubbiness[tokenId];
        uint256 tokenMouthLength = mouthLength[tokenId];
        
        // the translate function for the mouth is based on the curve y = 810/11 - 9x/11
        return string(
            abi.encodePacked(
                '<g id="eye1">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>',
                '</g>',
                '<g id="head">',
                '<ellipse fill="#',
                toColor(tokenColor),
                '" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="',
                uint2str(tokenChubbiness),
                '" ry="51.80065" stroke="#000"/>',
                '</g>',
                '<g id="eye2">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>',
                '</g>',
                '<g class="mouth" transform="translate(',
                uint2str(uint256((810 - 9 * tokenChubbiness) / 11)),
                ',0)">',
                '<path d="M 130 240 Q 165 250 ',
                uint2str(tokenMouthLength),
                ' 235" stroke="black" stroke-width="3" fill="transparent"/>',
                '</g>'
            )
        );
    }

    /**
     * @notice Convert bytes3 to color string
     * @param _bytes3 The color bytes
     * @return colorString The color string representation
     */
    function toColor(bytes3 _bytes3) internal pure returns (string memory colorString) {
        bytes memory hexBytes = new bytes(6);
        for (uint i = 0; i < 3; i++) {
            uint8 b = uint8(_bytes3[i]);
            hexBytes[i*2] = toHexChar(b / 16);
            hexBytes[i*2+1] = toHexChar(b % 16);
        }
        return string(hexBytes);
    }

    /**
     * @notice Convert a byte to hex character
     * @param b The byte value
     * @return hexChar The hex character
     */
    function toHexChar(uint8 b) internal pure returns (bytes1 hexChar) {
        if (b < 10) return bytes1(uint8(b + 48));
        else return bytes1(uint8(b + 87));
    }

    /**
     * @notice Convert uint to string
     * @param _i The uint value
     * @return stringRepresentation The string representation
     */
    function uint2str(uint _i) internal pure returns (string memory stringRepresentation) {
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
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Generate token metadata as JSON
     * @param tokenId The token ID
     * @return metadataJSON The token metadata as JSON string
     */
    function generateTokenMetadata(bytes32 tokenId) internal view returns (bytes memory metadataJSON) {
        string memory name = string(
            abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString())
        );
        
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                toColor(color[tokenId]),
                " with a chubbiness of ",
                uint2str(chubbiness[tokenId]),
                " and mouth length of ",
                uint2str(mouthLength[tokenId]),
                "!!!"
            )
        );
        
        // Generate SVG and encode to base64
        string memory image = Base64.encode(bytes(generateSVGofTokenById(tokenId)));
        
        // Format attributes for LUKSO standard
        bytes memory attributes = abi.encodePacked(
            '[{"key": "color", "value": "#', toColor(color[tokenId]), '", "type": "string"},',
            '{"key": "chubbiness", "value": ', uint2str(chubbiness[tokenId]), ', "type": "number"},',
            '{"key": "mouthLength", "value": ', uint2str(mouthLength[tokenId]), ', "type": "number"}]'
        );
        
        // Generate metadata JSON following LSP4 format
        return abi.encodePacked(
            '{"LSP4Metadata": {',
            '"name": "', name, '",',
            '"description": "', description, '",',
            '"links": [],',
            '"icon": [],',
            '"images": [[{"width": 400, "height": 400, "url": "data:image/svg+xml;base64,', image, '"}]],',
            '"attributes": ', attributes,
            '}}'
        );
    }
    
    /**
     * @notice Override _getDataForTokenId to provide metadata
     * @param tokenId The token ID
     * @param dataKey The data key
     * @return dataValues The retrieved data values
     */
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual override returns (bytes memory dataValues) {
        // Only override for LSP4Metadata key
        if (dataKey != _LSP4_METADATA_KEY) {
            return super._getDataForTokenId(tokenId, dataKey);
        }
        
        // Generate token metadata
        bytes memory metadata = generateTokenMetadata(tokenId);
        
        // Encode the metadata following LUKSO verifiable metadata format
        bytes memory encoded = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(metadata)
        );
        
        // Return LUKSO verifiable URI format
        return abi.encodePacked(
            hex"00006f357c6a0020",  // LUKSO metadata prefix
            keccak256(metadata),    // hash of metadata
            encoded                 // encoded metadata
        );
    }
} 
 