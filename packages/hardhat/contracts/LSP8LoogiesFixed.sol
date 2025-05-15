// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ILSP0ERC725Account.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./ILSP3Profile.sol";
import "./LSP4Constants.sol";

/**
 * @title LoogieMetadata
 * @notice Handles the on-chain metadata generation for LuksoLoogies
 */
contract LoogieMetadata {
    using Strings for uint256;
    using Strings for uint8;
    
    // Define path patterns for Loogies SVG
    string[] private headPaths = [
        "M 200 200 m -70 0 a 70 50 0 1 0 140 0 a 70 50 0 1 0 -140 0",
        "M 200 200 m -65 0 a 65 55 0 1 0 130 0 a 65 55 0 1 0 -130 0",
        "M 200 200 m -75 0 a 75 45 0 1 0 150 0 a 75 45 0 1 0 -150 0"
    ];
    
    string[] private eyePaths = [
        "M 170 180 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0 M 230 180 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0",
        "M 170 170 m -12 0 a 12 18 0 1 0 24 0 a 12 18 0 1 0 -24 0 M 230 170 m -12 0 a 12 18 0 1 0 24 0 a 12 18 0 1 0 -24 0",
        "M 170 180 m -17 0 a 17 13 0 1 0 34 0 a 17 13 0 1 0 -34 0 M 230 180 m -17 0 a 17 13 0 1 0 34 0 a 17 13 0 1 0 -34 0"
    ];
    
    string[] private mouthPaths = [
        "M 160 220 Q 200 240 240 220",
        "M 160 220 Q 200 250 240 220",
        "M 160 225 Q 200 235 240 225"
    ];
    
    string[] private pupilPaths = [
        "M 170 180 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 230 180 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0",
        "M 170 170 m -4 0 a 4 6 0 1 0 8 0 a 4 6 0 1 0 -8 0 M 230 170 m -4 0 a 4 6 0 1 0 8 0 a 4 6 0 1 0 -8 0",
        "M 170 180 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 230 180 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
    ];
    
    // Loogie type data
    struct LoogieType {
        string typeName;
        string bodyColor;
        string eyeColor;
        string pupilColor;
        string strokeColor;
    }
    
    mapping(string => LoogieType) public loogieTypes;
    
    constructor() {
        // Set up default Loogie types
        loogieTypes["green"] = LoogieType("green", "#a3e635", "#ffffff", "#000000", "#000000");
        loogieTypes["blue"] = LoogieType("blue", "#3b82f6", "#ffffff", "#000000", "#000000");
        loogieTypes["red"] = LoogieType("red", "#ef4444", "#ffffff", "#000000", "#000000");
        loogieTypes["purple"] = LoogieType("purple", "#a855f7", "#ffffff", "#000000", "#000000");
        loogieTypes["yellow"] = LoogieType("yellow", "#facc15", "#ffffff", "#000000", "#000000");
    }
    
    /**
     * @dev Get a random path index using the tokenId seed
     */
    function getRandomPathIndex(bytes32 tokenId, uint8 offset, uint8 max) internal pure returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(tokenId, offset)))) % max;
    }
    
    /**
     * @dev Converts a bytes3 color to a hex string
     */
    function toColorHex(bytes3 colorBytes) public pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory buffer = new bytes(6);
        
        for (uint i = 0; i < 3; i++) {
            buffer[i*2] = hexChars[uint8(colorBytes[i]) >> 4];
            buffer[i*2 + 1] = hexChars[uint8(colorBytes[i]) & 0x0f];
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Generate SVG for a Loogie
     */
    function generateLoogieSVG(
        bytes32 tokenId,
        string memory loogieType,
        bytes3 colorValue,
        uint256 chubbinessValue,
        uint256 mouthLengthValue,
        string memory username
    ) internal view returns (string memory) {
        // Get path indices for variation
        uint8 headIdx = getRandomPathIndex(tokenId, 0, 3);
        uint8 eyeIdx = getRandomPathIndex(tokenId, 1, 3);
        uint8 mouthIdx = getRandomPathIndex(tokenId, 2, 3);
        uint8 pupilIdx = getRandomPathIndex(tokenId, 3, 3);
        
        // Get loogie type and colors
        LoogieType memory lType = loogieTypes[loogieType];
        string memory colorHex = toColorHex(colorValue);
        
        // If type doesn't exist, use the color
        string memory bodyColor = bytes(lType.bodyColor).length > 0 ? lType.bodyColor : string(abi.encodePacked("#", colorHex));
        string memory eyeColor = bytes(lType.eyeColor).length > 0 ? lType.eyeColor : "#ffffff";
        string memory pupilColor = bytes(lType.pupilColor).length > 0 ? lType.pupilColor : "#000000";
        string memory strokeColor = bytes(lType.strokeColor).length > 0 ? lType.strokeColor : "#000000";
        
        // Generate SVG
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
                '<style>',
                '.head{fill:', bodyColor, ';stroke:', strokeColor, ';stroke-width:3px;}',
                '.eyes{fill:', eyeColor, ';stroke:', strokeColor, ';stroke-width:2px;}',
                '.pupils{fill:', pupilColor, ';stroke:none;}',
                '.mouth{fill:none;stroke:', strokeColor, ';stroke-width:3px;}',
                '</style>',
                '<rect width="400" height="400" fill="#000000"/>',
                '<path d="', headPaths[headIdx], '" class="head"/>',
                '<path d="', eyePaths[eyeIdx], '" class="eyes"/>',
                '<path d="', pupilPaths[pupilIdx], '" class="pupils"/>',
                '<path d="', mouthPaths[mouthIdx], '" class="mouth"/>',
                '<text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">', 
                username, 
                '</text>',
                '</svg>'
            )
        );
        
        return svg;
    }
    
    /**
     * @dev Generate the collection image SVG
     */
    function generateCollectionSVG() public pure returns (string memory svg, string memory encodedSvg) {
        svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
                '<rect width="400" height="400" fill="#000"/>',
                '<text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">LuksoLoogies</text>',
                '<text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle">Fixed Edition</text>',
                '</svg>'
            )
        );
        
        encodedSvg = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );
        
        return (svg, encodedSvg);
    }
    
    /**
     * @dev Get the encoded token metadata
     */
    function getTokenMetadata(
        bytes32 tokenId,
        string memory loogieTypeValue,
        bytes3 colorBytes,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username
    ) public view returns (bytes memory rawMetadata, bytes memory encodedMetadata) {
        // Generate SVG for token
        string memory svg = generateLoogieSVG(
            tokenId, 
            loogieTypeValue, 
            colorBytes, 
            chubbiness, 
            mouthLength, 
            username
        );
        
        // Calculate verification hash
        bytes32 svgHash = keccak256(bytes(svg));
        
        // Get color hex
        string memory colorHex = toColorHex(colorBytes);
        
        // Create token name and description
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                colorHex,
                " with a chubbiness of ",
                chubbiness.toString(),
                " and mouth length of ",
                mouthLength.toString(),
                "."
            )
        );
        
        // Format LSP4 metadata
        rawMetadata = abi.encodePacked(
            '{"LSP4Metadata": {"name": "', tokenName, 
            '","description": "', description, 
            '","links": [{"title":"Website","url":"https://luksoloogies.vercel.app"}],"icon":[],',
            '"images": [[{"width": 400,"height": 400,',
            '"url": "', svg, '","verification": {"method": "keccak256(bytes)","data": "0x', 
            bytes32ToHexString(svgHash), '"}}]],',
            '"attributes":[',
            '{"key":"color","value":"#', colorHex, '","type":"string"},',
            '{"key":"chubbiness","value":', chubbiness.toString(), ',"type":"number"},',
            '{"key":"mouthLength","value":', mouthLength.toString(), ',"type":"number"},',
            '{"key":"username","value":"', username, '","type":"string"},',
            '{"key":"type","value":"', loogieTypeValue, '","type":"string"}',
            ']}}'
        );
        
        // Encode the metadata
        encodedMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(rawMetadata)
        );
        
        return (rawMetadata, encodedMetadata);
    }
    
    /**
     * @dev Get the encoded collection metadata
     */
    function getCollectionMetadata(uint256 limit) public view returns (bytes memory rawMetadata, bytes memory encodedMetadata) {
        // Generate collection SVG
        (string memory collectionSvg, string memory encodedSvg) = generateCollectionSVG();
        
        // Calculate verification hash
        bytes32 svgHash = keccak256(bytes(encodedSvg));
        
        // Format LSP4 metadata
        rawMetadata = abi.encodePacked(
            '{"LSP4Metadata":{',
            '"name":"LuksoLoogies Fixed",',
            '"description":"LuksoLoogies are LUKSO Standard LSP8 NFTs with a smile :) Only ', limit.toString(), ' LuksoLoogies available on a price curve increasing 0.2% with each new mint. This fixed version shows proper token attributes and SVG rendering.",',
            '"links":[{"title":"Website","url":"https://luksoloogies.vercel.app"},{"title":"Twitter","url":"https://twitter.com/luksoLoogies"}],',
            '"images":[[{',
            '"width":400,',
            '"height":400,',
            '"url":"', encodedSvg, '",',
            '"verification":{"method":"keccak256(bytes)","data":"0x', bytes32ToHexString(svgHash), '"}',
            '}]],',
            // Collection-specific attributes
            '"attributes":[',
            '{"key":"type","value":"collection","type":"string"},',
            '{"key":"limit","value":', limit.toString(), ',"type":"number"},',
            '{"key":"curve","value":100.2,"type":"number"}',
            ']',
            '}}'
        );
        
        // Encode the metadata
        encodedMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(rawMetadata)
        );
        
        return (rawMetadata, encodedMetadata);
    }
    
    /**
     * @dev Converts a bytes32 to hex string
     */
    function bytes32ToHexString(bytes32 value) public pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory buffer = new bytes(64);
        
        for (uint256 i = 0; i < 32; i++) {
            buffer[i*2] = hexChars[uint8(value[i]) >> 4];
            buffer[i*2 + 1] = hexChars[uint8(value[i]) & 0x0f];
        }
        
        return string(buffer);
    }
}

/**
 * @title LSP8LoogiesFixed
 * @notice A simplified version of LSP8Loogies with proper SVG rendering and metadata
 */
contract LSP8LoogiesFixed is LSP8IdentifiableDigitalAsset, ReentrancyGuard {
    using Strings for uint256;
    
    // Metadata contract
    LoogieMetadata public loogieMetadata;
    
    // Token attributes
    uint256 private _tokenIds;
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;
    mapping(bytes32 => string) public loogieTypes;
    mapping(bytes32 => string) public upUsernames;
    
    // Collection constants
    uint256 public constant limit = 3728;
    uint256 public constant curve = 1002; // price increase 0.2% with each purchase
    uint256 public price = 0.1 ether;
    
    // Funds recipient
    address payable public constant recipient = payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);
    
    // Interface IDs
    bytes4 constant _INTERFACEID_LSP0 = 0x3a271fff;
    
    /**
     * @dev Convert bytes3 to hex string
     */
    function toColorHex(bytes3 value) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory buffer = new bytes(6);
        
        for (uint i = 0; i < 3; i++) {
            buffer[i*2] = hexChars[uint8(value[i]) >> 4];
            buffer[i*2 + 1] = hexChars[uint8(value[i]) & 0x0f];
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Converts a bytes32 to hex string
     */
    function bytes32ToHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory buffer = new bytes(64);
        
        for (uint256 i = 0; i < 32; i++) {
            buffer[i*2] = hexChars[uint8(value[i]) >> 4];
            buffer[i*2 + 1] = hexChars[uint8(value[i]) & 0x0f];
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Get SVG string for a Loogie based on its attributes
     */
    function getLoogieSVG(
        string memory loogieType,
        bytes3 colorValue,
        uint256 chubbinessValue,
        uint256 mouthLengthValue,
        string memory username
    ) internal view returns (string memory) {
        // Convert color to hex
        string memory colorHex = toColorHex(colorValue);
        
        // Determine colors based on loogie type
        string memory bodyColor;
        if (keccak256(bytes(loogieType)) == keccak256(bytes("green"))) {
            bodyColor = "#a3e635";
        } else if (keccak256(bytes(loogieType)) == keccak256(bytes("blue"))) {
            bodyColor = "#3b82f6";
        } else if (keccak256(bytes(loogieType)) == keccak256(bytes("red"))) {
            bodyColor = "#ef4444";
        } else if (keccak256(bytes(loogieType)) == keccak256(bytes("purple"))) {
            bodyColor = "#a855f7";
        } else if (keccak256(bytes(loogieType)) == keccak256(bytes("yellow"))) {
            bodyColor = "#facc15";
        } else {
            bodyColor = string(abi.encodePacked("#", colorHex));
        }
        
        // Generate SVG with simple paths
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
                '<rect width="400" height="400" fill="#000000"/>',
                '<g>',
                // Body
                '<ellipse cx="200" cy="200" rx="70" ry="', 
                chubbinessValue.toString(), 
                '" fill="', 
                bodyColor, 
                '" stroke="#000000" stroke-width="3"/>',
                // Eyes
                '<circle cx="170" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>',
                '<circle cx="230" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>',
                // Pupils
                '<circle cx="170" cy="180" r="5" fill="#000000"/>',
                '<circle cx="230" cy="180" r="5" fill="#000000"/>',
                // Mouth
                '<path d="M ', 
                (200 - mouthLengthValue/2).toString(), 
                ' 220 Q 200 240 ', 
                (200 + mouthLengthValue/2).toString(), 
                ' 220" fill="none" stroke="#000000" stroke-width="3"/>',
                // Username
                '<text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">',
                username,
                '</text>',
                '</g>',
                '</svg>'
            )
        );
    }
    
    /**
     * @dev Get SVG string for the collection
     */
    function getCollectionSVG() internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
                '<rect width="400" height="400" fill="#000"/>',
                '<text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">LuksoLoogies</text>',
                '<text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle">Fixed Edition</text>',
                '</svg>'
            )
        );
    }
    
    /**
     * @dev Constructor
     */
    constructor(address contractOwner) 
    LSP8IdentifiableDigitalAsset(
        "LuksoLoogies Fixed", 
        "LUKLOGFIX", 
        contractOwner, 
        _LSP4_TOKEN_TYPE_COLLECTION, // Collection (2)
        0 // Token ID format (0)
    ) {
        // Deploy metadata contract
        loogieMetadata = new LoogieMetadata();
        
        // Set supported standard
        _setData(_LSP4_SUPPORTED_STANDARDS_KEY, _LSP4_SUPPORTED_STANDARDS_VALUE);
        
        // Set collection metadata
        _updateCollectionMetadata();
        
        // Set collection supply data
        bytes32 LSP4_METADATA_TOTAL_SUPPLY = 0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f;
        _setData(LSP4_METADATA_TOTAL_SUPPLY, bytes.concat(bytes32(uint256(limit))));
        
        bytes32 LSP4_METADATA_MAX_SUPPLY = 0xd28c95357cf4c94d638a4f572d5d3df8d7e1415c8b650e747a219c559d1435c8;
        _setData(LSP4_METADATA_MAX_SUPPLY, bytes.concat(bytes32(uint256(limit))));
        
        // Set metadata count
        bytes32 LSP4_CREATORS_MAP_LENGTH_KEY = 0x6de85eaf5d982b4e5da00000d8c2f51c0e567ed9ec7b1f9ee90bb0b2839d168d;
        _setData(LSP4_CREATORS_MAP_LENGTH_KEY, bytes.concat(bytes32(uint256(1))));
    }
    
    /**
     * @dev Get standard name()
     */
    function name() public view returns (string memory) {
        return string(getData(_LSP4_TOKEN_NAME_KEY));
    }
    
    /**
     * @dev Get standard symbol()
     */
    function symbol() public view returns (string memory) {
        return string(getData(_LSP4_TOKEN_SYMBOL_KEY));
    }
    
    /**
     * @dev Get totalSupply
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Public mint with payment
     */
    function mintItem() public payable returns (bytes32) {
        require(_tokenIds < limit, "DONE MINTING");
        require(msg.value >= price, "NOT ENOUGH");
        
        price = (price * curve) / 1000;
        
        _tokenIds += 1;
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        
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
        
        mouthLength[tokenId] = 180 + ((uint256(chubbiness[tokenId] / 4) * uint256(uint8(predictableRandom[4]))) / 255);
        
        // Randomly assign loogie type
        uint256 typeIndex = uint256(uint8(predictableRandom[5])) % 5;
        if (typeIndex == 0) loogieTypes[tokenId] = "green";
        else if (typeIndex == 1) loogieTypes[tokenId] = "blue";
        else if (typeIndex == 2) loogieTypes[tokenId] = "red";
        else if (typeIndex == 3) loogieTypes[tokenId] = "purple";
        else loogieTypes[tokenId] = "yellow";
        
        // Set default username
        upUsernames[tokenId] = "luksonaut";
        
        // Mint the token
        _mint(msg.sender, tokenId, true, "");
        
        // Send funds to recipient
        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");
        
        return tokenId;
    }
    
    /**
     * @dev Mint for specific address (for team minting)
     */
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
        
        // Set token attributes
        color[tokenId] = bytes2(predictableRandom[0]) |
            (bytes2(predictableRandom[1]) >> 8) |
            (bytes3(predictableRandom[2]) >> 16);
            
        chubbiness[tokenId] = 35 + ((55 * uint256(uint8(predictableRandom[3]))) / 255);
        
        mouthLength[tokenId] = 180 + ((uint256(chubbiness[tokenId] / 4) * uint256(uint8(predictableRandom[4]))) / 255);
        
        // Randomly assign loogie type
        uint256 typeIndex = uint256(uint8(predictableRandom[5])) % 5;
        if (typeIndex == 0) loogieTypes[tokenId] = "green";
        else if (typeIndex == 1) loogieTypes[tokenId] = "blue";
        else if (typeIndex == 2) loogieTypes[tokenId] = "red";
        else if (typeIndex == 3) loogieTypes[tokenId] = "purple";
        else loogieTypes[tokenId] = "yellow";
        
        // Set default username
        upUsernames[tokenId] = "luksonaut";
        
        // Mint the token
        _mint(to, tokenId, true, "");
        
        return tokenId;
    }
    
    /**
     * @dev Set username for a token
     */
    function setUPUsername(bytes32 tokenId, string memory username) public {
        address tokenOwner = tokenOwnerOf(tokenId);
        require(tokenOwner == msg.sender || isUniversalProfile(tokenOwner), "LSP8: Not authorized");
        upUsernames[tokenId] = username;
    }
    
    /**
     * @dev Check if address is Universal Profile
     */
    function isUniversalProfile(address account) public view returns (bool) {
        // Check if account supports LSP0 interface
        try IERC165(account).supportsInterface(_INTERFACEID_LSP0) returns (bool supportsLSP0) {
            if (supportsLSP0) {
                try IERC165(account).supportsInterface(_INTERFACEID_LSP1) returns (bool supportsLSP1) {
                    return supportsLSP1;
                } catch {
                    return false;
                }
            }
            return false;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Update collection metadata
     */
    function updateCollectionMetadata() public {
        require(msg.sender == owner(), "LSP8: Not authorized");
        _updateCollectionMetadata();
    }
    
    /**
     * @dev Internal function to update collection metadata
     */
    function _updateCollectionMetadata() internal {
        // Generate collection SVG
        string memory collectionSvg = getCollectionSVG();
        string memory encodedSvg = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(collectionSvg))
            )
        );
        
        // Calculate verification hash
        bytes32 svgHash = keccak256(bytes(encodedSvg));
        
        // Format LSP4 metadata
        string memory rawMetadata = string(
            abi.encodePacked(
                '{"LSP4Metadata":{',
                '"name":"LuksoLoogies Fixed",',
                '"description":"LuksoLoogies are LUKSO Standard LSP8 NFTs with a smile :) Only ', limit.toString(), ' LuksoLoogies available on a price curve increasing 0.2% with each new mint. This fixed version shows proper token attributes and SVG rendering.",',
                '"links":[{"title":"Website","url":"https://luksoloogies.vercel.app"},{"title":"Twitter","url":"https://twitter.com/luksoLoogies"}],',
                '"images":[[{',
                '"width":400,',
                '"height":400,',
                '"url":"', encodedSvg, '",',
                '"verification":{"method":"keccak256(bytes)","data":"0x', bytes32ToHexString(svgHash), '"}',
                '}]],',
                // Collection-specific attributes
                '"attributes":[',
                '{"key":"type","value":"collection","type":"string"},',
                '{"key":"limit","value":', limit.toString(), ',"type":"number"},',
                '{"key":"curve","value":100.2,"type":"number"}',
                ']',
                '}}'
            )
        );
        
        // Encode the metadata
        string memory encodedMetadata = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(rawMetadata))
            )
        );
        
        // Store metadata in LSP4 format
        _setData(_LSP4_METADATA_KEY, bytes.concat(
            hex"00006f357c6a0020",
            keccak256(bytes(rawMetadata)),
            bytes(encodedMetadata)
        ));
    }
    
    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return 
            interfaceId == _INTERFACEID_LSP8 || 
            super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override _getDataForTokenId to return token-specific metadata
     */
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual override returns (bytes memory dataValues) {
        // Only override for LSP4 metadata key
        if (dataKey != _LSP4_METADATA_KEY) {
            return super._getDataForTokenId(tokenId, dataKey);
        }
        
        // Get token attributes
        string memory username = upUsernames[tokenId];
        bytes3 colorValue = color[tokenId];
        uint256 chubbinessValue = chubbiness[tokenId];
        uint256 mouthLengthValue = mouthLength[tokenId];
        string memory loogieType = loogieTypes[tokenId];
        
        // Convert color to hex for display
        string memory colorHex = toColorHex(colorValue);
        
        // Generate SVG
        string memory svgImage = getLoogieSVG(
            loogieType,
            colorValue,
            chubbinessValue,
            mouthLengthValue,
            username
        );
        
        // Encode SVG
        string memory encodedSvg = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svgImage))
            )
        );
        
        // Calculate verification hash
        bytes32 svgHash = keccak256(bytes(encodedSvg));
        
        // Create token name and description
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Loogie is the color #",
                colorHex,
                " with a chubbiness of ",
                chubbinessValue.toString(),
                " and mouth length of ",
                mouthLengthValue.toString(),
                "."
            )
        );
        
        // Format LSP4 metadata with proper token attributes structure
        string memory rawMetadata = string(
            abi.encodePacked(
                '{"LSP4Metadata": {"name": "', tokenName, 
                '","description": "', description, 
                '","links": [{"title":"Website","url":"https://luksoloogies.vercel.app"}],"icon":[],',
                '"images": [[{"width": 400,"height": 400,',
                '"url": "', encodedSvg, '","verification": {"method": "keccak256(bytes)","data": "0x', 
                bytes32ToHexString(svgHash), '"}}]],',
                '"attributes":[',
                '{"key":"color","value":"#', colorHex, '","type":"string"},',
                '{"key":"chubbiness","value":', chubbinessValue.toString(), ',"type":"number"},',
                '{"key":"mouthLength","value":', mouthLengthValue.toString(), ',"type":"number"},',
                '{"key":"username","value":"', username, '","type":"string"},',
                '{"key":"type","value":"', loogieType, '","type":"string"}',
                ']}}'
            )
        );
        
        // Encode the metadata
        string memory encodedMetadata = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(rawMetadata))
            )
        );
        
        // Return in LSP4 format
        return bytes.concat(
            hex"00006f357c6a0020",
            keccak256(bytes(rawMetadata)),
            bytes(encodedMetadata)
        );
    }
} 