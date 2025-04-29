// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./HexStrings.sol";
import "./ToColor.sol";

contract LSP8Loogies is LSP8IdentifiableDigitalAsset, LSP8Mintable, LSP8Burnable {
    using Strings for uint256;
    using Strings for uint8;
    using HexStrings for uint160;
    using ToColor for bytes3;

    uint256 private _tokenIds;
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;

    constructor(
        string memory name,
        string memory symbol,
        address contractOwner
    ) LSP8IdentifiableDigitalAsset(name, symbol, contractOwner, LSP8_TOKENID_FORMAT_NUMBER) {}

    function mintLoogie(address to) public returns (bytes32) {
        _tokenIds += 1;
        bytes32 tokenId = bytes32(uint256(_tokenIds));

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

    function tokenURI(bytes32 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "LSP8: Token does not exist");
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
                            (uint160(tokenOwnerOf(tokenId))).toHexString(20),
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

    function _exists(bytes32 tokenId) internal view returns (bool) {
        return tokenOwnerOf(tokenId) != address(0);
    }
}
