// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
/*
* Onchain Metadata for GM Beans
*/
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
contract OnChainMetadata {
    string[] public pool = ['pink', 'gold', 'blue', 'arabica', 'liberica', 'excelsa', 'robustica'];
    string[11] private classes = ["cls-2", "cls-1", "cls-3", "cls-1", "cls-2", "cls-1", "cls-3", "cls-1", "cls-2", "cls-1", "cls-2"];
    string[11] private paths = [
        "M1720 1700h190v190h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-190h190v190h-190zm-190 1280h190v180h-190",
        "M1530 1700h190v190h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190",
        "M1530 980h190v180h-190 M1530 610h190v190h-190 M970 430h190v180H970 M1340 800h190v180h-190zm0-190h190v190h-190",
        "M1530 800h190v180h-190 M1340 430h190v180h-190 M1160 1890h180v180h-180",
        "M1530 430h190v180h-190zm-190 1640h190v180h-190 M1160 250h180v180h-180zM970 2070h190v180H970",
        "M1340 1890h190v180h-190zm0-190h190v190h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190zm0-180h190v180h-190",
        "M1160 1700h180v190h-180zm0-180h180v180h-180zm0-180h180v180h-180zm0-180h180v180h-180zm0-180h180v180h-180zm0-180h180v180h-180zm0-190h180v190h-180zm0-180h180v180h-180",
        "M970 1890h190v180H970zm0-190h190v190H970zm0-180h190v180H970zm0-180h190v180H970zm0-180h190v180H970zm0-180h190v180H970zm0-180h190v180H970zm0-190h190v190H970",
        "M970 250h190v180H970zM780 1890h190v180H780zm0-190h190v190H780 M1340 250h190v180h-190zm-180 1820h180v180h-180",
        "M780 1520h190v180H780zm0-180h190v180H780zm0-180h190v180H780zm0-180h190v180H780zm0-180h190v180H780",
        "M780 610h190v190H780zm0-180h190v180H780zM590 1700h190v190H590zm0-180h190v180H590zm0-180h190v180H590zm0-180h190v180H590zm0-180h190v180H590zm0-180h190v180H590zm0-190h190v190H590"
    ];
    
    struct Colors {
        string cls_1; // Outline
        string cls_2; // Main
        string cls_3; // Crease Line
    }

    struct Metadata {
        string index;
        string beanType;
        string variation;
        string encoded;
        Colors colors;
    }

    mapping(string => Metadata) public metadata;
    mapping(string => uint256) public distribution;
    mapping(string => uint256) public totalMinted;

    /// Setup

    constructor() {
        ///totalMinted
        totalMinted["arabica"] = 0;
        totalMinted["liberica"] = 0;
        totalMinted["excelsa"] = 0;
        totalMinted["robustica"] = 0;
        totalMinted["blue"] = 0;
        totalMinted["gold"] = 0;
        totalMinted["pink"] = 0;
        distribution["arabica"] = 687;
        distribution["liberica"] = 687;
        distribution["excelsa"] = 687;
        distribution["robustica"] = 687;
        distribution["blue"] = 1200;
        distribution["gold"] = 210;
        distribution["pink"] = 42;
    }
    /// TODO: create the batch setup function
    function _setUp(string memory _index, string[] memory data) internal {
        metadata[_index] = Metadata({
            index: data[0],
            beanType: data[1],
            variation: data[2],
            encoded: data[3],
            colors: Colors({
                cls_1: data[4],
                cls_2: data[5],
                cls_3: data[6]
            })
        });
    }

    function updatePool(string memory _beanType) private {
        totalMinted[_beanType]++;
        if(totalMinted[_beanType] >= distribution[_beanType]) {
            for (uint256 i = 0; i < pool.length; i++) {
                if (totalMinted[pool[i]] >= distribution[pool[i]]) {
                    pool[i] = pool[pool.length - 1];
                    pool.pop();
                }
            }
        }
    }

    function getRandomBean() internal returns (string memory) {
        uint256 _total = 0;
        for (uint256 i = 0; i < pool.length; i++) {
            _total += distribution[pool[i]] - totalMinted[pool[i]];
        }
        if(_total == 0) revert('No options left');
        uint256 _random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % _total;

        uint256 range_a = 0;
        uint256 range_b = 0;
        
        for (uint256 i = 0; i < pool.length; i++) {
            range_b += distribution[pool[i]] - totalMinted[pool[i]];
            if(_random >= range_a && _random < range_b && 
                keccak256(abi.encodePacked(metadata[pool[i]].index)) == keccak256(abi.encodePacked(pool[i]))
            ) {
                string memory _beanType = pool[i];
                updatePool(_beanType);
                return _beanType;
            }
            range_a = range_b;
        }
        revert('BeanType not found');
    }

    function renderAndEncodeFromSVG(string memory _beanType) internal view returns (bytes memory) {
        Metadata memory _metadata = metadata[_beanType];
        bytes memory svg;
        for(uint8 i = 0; i < paths.length; i++) {
            svg = abi.encodePacked(svg, '<path d="', paths[i], '" class="', classes[i], '"/>');
        }
        svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 2500" width="600" height="600">',
                '<style>.cls-1{fill:', _metadata.colors.cls_1,';}.cls-1,.cls-2,.cls-3{stroke-width:0px;}.cls-2{fill:', _metadata.colors.cls_2,';}.cls-3{fill:', _metadata.colors.cls_3,';}</style>',
                svg,
            '</svg>'
        );
        return abi.encodePacked(
            'data:image/svg+xml;base64,',
            Base64.encode(svg)
        );
    }

    function getMetadataBytes(string memory _beanType) internal view returns (bytes memory, bytes memory) {
        Metadata memory _metadata = metadata[_beanType];
        bytes memory _encodedSVG = renderAndEncodeFromSVG(_beanType);
        bytes memory _rawMetadata = abi.encodePacked(
            '{"LSP4Metadata": {"name": "GM Bean","description": "Celebrate being UP early and boost your day with coffee.","links": [],"icon":[],"images": [[{"width": 600,"height": 600,',
            '"url": "',_encodedSVG,'","verification": {"method": "keccak256(bytes)","data": "',_metadata.encoded,'"}}]],',
            '"attributes":[{"key": "Type","value": "',_metadata.beanType,'","type": "string"}, {"key": "Variation","value": "',_metadata.variation,'","type": "string"}]}}'
        );
        return (_rawMetadata, abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(_rawMetadata)
        ));
    }    
}