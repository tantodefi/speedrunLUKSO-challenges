// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./HexStrings.sol";
import "./ToColor.sol";
// Patch for LUKSO v0.16.x compatibility
library LSP8CompatPatch {
    bytes4 constant LSP8_TOKENID_FORMAT_NUMBER = 0x00000000;
}

import {LSP2Utils} from "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";

contract LSP8Loogies is LSP8IdentifiableDigitalAsset {
    using Strings for uint256;
    using Strings for uint8;
    using HexStrings for uint256;
    using ToColor for bytes3;

    uint256 private _tokenIds;
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;
    // Store existing token IDs to check existence at runtime
    mapping(uint256 => bool) private _tokenIdExists;

    // all funds go to buidlguidl.eth (same as in YourCollectible)
    address payable public constant recipient =
        payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);

    uint256 public constant limit = 3728;
    uint256 public constant curve = 1002; // price increase 0,4% with each purchase
    uint256 public price = 0.001 ether;
    // the 1154th optimistic loogies cost 0.01 ETH, the 2306th cost 0.1ETH, the 3459th cost 1 ETH and the last ones cost 1.7 ETH

    constructor(
        address contractOwner
    ) LSP8IdentifiableDigitalAsset(
        "OptimisticLoogies", 
        "OPLOOG", 
        contractOwner, 
        1, 
        uint256(uint32(LSP8CompatPatch.LSP8_TOKENID_FORMAT_NUMBER))
    ) {}

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

        _mint(to, tokenId, true, "");
        return tokenId;
    }

    // Helper function to check if a token exists by its uint256 ID
    function tokenExists(uint256 id) public view returns (bool) {
        return _tokenIdExists[id];
    }

    // Get all existing token IDs up to the current total supply
    function getAllTokenIds() public view returns (uint256[] memory) {
        uint256 totalCount = _tokenIds;
        uint256[] memory result = new uint256[](totalCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (_tokenIdExists[i]) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        return result;
    }

    function tokenURI(bytes32 tokenId) public view returns (string memory) {
        require(tokenOwnerOf(tokenId) != address(0), "LSP8: Token does not exist");
        string memory name = string(abi.encodePacked("Loogie #", uint256(tokenId).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                color[tokenId].toColor(),
                " with a chubbiness of ",
                uint2str(chubbiness[tokenId]),
                " and mouth length of ",
                uint2str(mouthLength[tokenId]),
                "!!!"
            )
        );
        string memory image = Base64.encode(bytes(generateSVGofTokenById(tokenId)));
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name,
                            '", "description":"',
                            description,
                            '", "external_url":"https://burnyboys.com/token/',
                            uint256(tokenId).toString(),
                            '", "attributes": [{"trait_type": "color", "value": "#',
                            color[tokenId].toColor(),
                            '"},{"trait_type": "chubbiness", "value": ',
                            uint2str(chubbiness[tokenId]),
                            '},{"trait_type": "mouthLength", "value": ',
                            uint2str(mouthLength[tokenId]),
                            '}], "owner":"',
                            HexStrings.toHexString(uint256(uint160(tokenOwnerOf(tokenId))), 20),
                            '", "image": "data:image/svg+xml;base64,',
                            image,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function generateSVGofTokenById(bytes32 tokenId) internal view returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                renderTokenById(tokenId),
                "</svg>"
            )
        );
        return svg;
    }

    function renderTokenById(bytes32 tokenId) public view returns (string memory) {
        string memory render = string(
            abi.encodePacked(
                '<g id="eye1">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>',
                "</g>",
                '<g id="head">',
                '<ellipse fill="#',
                color[tokenId].toColor(),
                '" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="',
                uint2str(chubbiness[tokenId]),
                '" ry="51.80065" stroke="#000"/>',
                "</g>",
                '<g id="eye2">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>',
                "</g>",
                '<g class="mouth" transform="translate(',
                uint2str((810 - 9 * chubbiness[tokenId]) / 11),
                ',0)">',
                '<path d="M 130 240 Q 165 250 ',
                uint2str(mouthLength[tokenId]),
                ' 235" stroke="black" stroke-width="3" fill="transparent"/>',
                "</g>"
            )
        );
        return render;
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
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

    // --- Required LSP8 overrides for multiple inheritance ---
    function getData(bytes32 key) public view override returns (bytes memory) {
        return super.getData(key);
    }

    function getDataBatch(bytes32[] memory keys) public view override returns (bytes[] memory) {
        return super.getDataBatch(keys);
    }

    function setData(bytes32 key, bytes memory value) public payable override {
        super.setData(key, value);
    }

    function setDataBatch(bytes32[] memory keys, bytes[] memory values) public payable override {
        super.setDataBatch(keys, values);
    }
}
