// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// LSP0 Universal Profile interface ID
interface IERC725Y {
    function getData(bytes32 dataKey) external view returns (bytes memory);
}

/**
 * @title OnChainMetadata
 * @notice Handles on-chain SVG generation and metadata formatting for LSP8Loogies
 * @dev Provides SVG generation and properly formatted LSP4 metadata
 */
contract OnChainMetadata {
    using Strings for uint256;

    // Universal Profile detection
    bytes4 constant _INTERFACE_ID_ERC725Y = 0x714df77c;
    bytes32 constant _LSP3_DATAKEY_NAME = 0xa5f25703c828c6d3c468fa5542c279e8c98f1acc783318e4fcd67ea8fd61be02;

    // Storage for metadata components
    mapping(string => string[]) private _parts;

    // UP Detection helper
    function isUniversalProfile(address account) internal view returns (bool) {
        try IERC165(account).supportsInterface(_INTERFACE_ID_ERC725Y) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }
    
    // Get UP name if available
    function getUPName(address account) internal view returns (string memory) {
        if (!isUniversalProfile(account)) {
            return "";
        }
        
        try IERC725Y(account).getData(_LSP3_DATAKEY_NAME) returns (bytes memory nameData) {
            if (nameData.length > 0) {
                // LSP3 name is encoded with prefix, extract the string part
                // First byte is the LSP2 valueContent (0 = DIRECT VALUE)
                // If first byte is 0, then the string starts at index 1
                if (nameData.length > 1 && nameData[0] == 0) {
                    // Create a new bytes array without the first byte
                    bytes memory strBytes = new bytes(nameData.length - 1);
                    for (uint i = 1; i < nameData.length; i++) {
                        strBytes[i-1] = nameData[i];
                    }
                    return string(strBytes);
                }
            }
            return "";
        } catch {
            return "";
        }
    }

    /**
     * @dev Set up metadata components
     * @param _index The index/category of components (e.g., "colors", "mouths")
     * @param data Array of component values
     */
    function _setUp(string memory _index, string[] memory data) internal {
        delete _parts[_index];
        for (uint i = 0; i < data.length; i++) {
            _parts[_index].push(data[i]);
        }
    }

    /**
     * @dev Get random loogie type
     * @return string The random loogie type
     */
    function getRandomLoogieType() internal view returns (string memory) {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % _parts["types"].length;
        return _parts["types"][rand];
    }

    /**
     * @dev Convert bytes3 to hex string
     * @param _color The color bytes
     * @return string The hex string
     */
    function toColorHexString(bytes3 _color) public pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(6);
        
        for (uint256 i = 0; i < 3; i++) {
            uint8 byteValue = uint8(_color[i]);
            result[i*2] = hexChars[uint8(byteValue >> 4)];
            result[i*2 + 1] = hexChars[uint8(byteValue & 0x0f)];
        }
        
        return string(result);
    }
    
    /**
     * @dev Convert uint to string
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
     * @dev Convert bytes32 to string
     * @param value The bytes32 to convert
     * @return string The hex string
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

    /**
     * @dev Generate Loogie SVG based on attributes
     * @param tokenId The token ID for randomization
     * @param loogieType The loogie type
     * @param colorValue The color value
     * @param chubbinessValue The chubbiness value
     * @param mouthLengthValue The mouth length value
     * @param username The username to display
     * @param isUP Whether the owner is a Universal Profile
     * @return string The complete SVG
     */
    function generateLoogieSVG(
        bytes32 tokenId,
        string memory loogieType,
        bytes3 colorValue,
        uint256 chubbinessValue,
        uint256 mouthLengthValue,
        string memory username,
        bool isUP
    ) public view returns (string memory) {
        // Determine body color based on loogie type and UP status
        string memory bodyColor;
        
        if (isUP) {
            // Vibrant colors for UP holders
            if (keccak256(bytes(loogieType)) == keccak256(bytes("green"))) {
                bodyColor = "#00ff00"; // Bright green
            } else if (keccak256(bytes(loogieType)) == keccak256(bytes("blue"))) {
                bodyColor = "#00ccff"; // Bright blue
            } else if (keccak256(bytes(loogieType)) == keccak256(bytes("red"))) {
                bodyColor = "#ff0066"; // Bright pink/red
            } else if (keccak256(bytes(loogieType)) == keccak256(bytes("purple"))) {
                bodyColor = "#cc00ff"; // Bright purple
            } else if (keccak256(bytes(loogieType)) == keccak256(bytes("yellow"))) {
                bodyColor = "#ffcc00"; // Bright yellow
            } else {
                bodyColor = string(abi.encodePacked("#", toColorHexString(colorValue)));
            }
        } else {
            // Regular colors for non-UP holders
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
                bodyColor = string(abi.encodePacked("#", toColorHexString(colorValue)));
            }
        }
        
        // Determine if we should add matrix rain effect
        // UP holders have 75% chance, regular accounts have 25% chance
        bool hasMatrixEffect = false;
        uint256 matrixSeed = uint256(keccak256(abi.encodePacked(tokenId, "matrix")));
        if (isUP) {
            hasMatrixEffect = matrixSeed % 4 < 3; // 75% chance
        } else {
            hasMatrixEffect = matrixSeed % 4 == 0; // 25% chance
        }
        
        // Set matrix color based on UP status
        string memory matrixColor = isUP ? "#ff00ff" : "#00ff00"; // Pink for UP, Green for regular
        
        // Calculate mouth position based on chubbiness
        uint256 mouthTranslate = (810 - 9 * chubbinessValue) / 11;
        
        // Generate Matrix Theme SVG with original Loogies shapes
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
                '<defs>',
                '<style>',
                '@import url("https://fonts.googleapis.com/css2?family=Comic+Sans+MS&amp;display=swap");',
                '.username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; text-anchor: middle; }',
                '.matrix-char { font-family: monospace; fill: ', matrixColor, '; opacity: 0.3; animation: fade 3s infinite, fall 8s linear infinite; }',
                '@keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }',
                '@keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }',
                '</style>',
                hasMatrixEffect ? generateMatrixRainEffect(tokenId) : "",
                '</defs>',
                '<rect width="400" height="400" fill="black"/>',
                hasMatrixEffect ? generateRandomMatrixChars(tokenId) : "",
                '<g class="loogie-container">',
                // First eye
                '<g id="eye1">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>',
                '</g>',
                // Head
                '<g id="head">',
                '<ellipse fill="', bodyColor, '" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="', 
                uint2str(chubbinessValue), '" ry="51.80065" stroke="#000"/>',
                '</g>',
                // Second eye
                '<g id="eye2">',
                '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>',
                '<ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>',
                '</g>',
                // Mouth with translation based on chubbiness
                '<g class="mouth" transform="translate(', uint2str(mouthTranslate), ',0)">',
                '<path d="M 130 240 Q 165 250 ', uint2str(mouthLengthValue), ' 235" stroke="black" stroke-width="3" fill="transparent"/>',
                '</g>',
                // Display username with Comic Sans for UP
                bytes(username).length > 0 ? 
                    (isUP ? 
                        string(abi.encodePacked('<text x="200" y="300" class="username" style="font-family: \'Comic Sans MS\', cursive;">', username, '</text>')) : 
                        string(abi.encodePacked('<text x="200" y="300" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">', username, '</text>'))
                    ) : '',
                '</g>',
                '</svg>'
            )
        );
        
        return svg;
    }
    
    /**
     * @dev Generate Matrix rain effect for SVG
     */
    function generateMatrixRainEffect(bytes32 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<filter id="matrix-glow" x="-20%" y="-20%" width="140%" height="140%">',
                '<feGaussianBlur stdDeviation="3" result="blur"/>',
                '<feComposite in="SourceGraphic" in2="blur" operator="over"/>',
                '</filter>',
                '<linearGradient id="matrix-bg" x1="0%" y1="0%" x2="0%" y2="100%">',
                '<stop offset="0%" stop-color="#000800"/>',
                '<stop offset="100%" stop-color="#001000"/>',
                '</linearGradient>'
            )
        );
    }
    
    /**
     * @dev Generate random Matrix characters for background
     */
    function generateRandomMatrixChars(bytes32 seed) internal pure returns (string memory) {
        string memory chars = '<g class="matrix-chars">';
        uint8[15] memory xPositions;
        
        // Generate random x positions for matrix columns
        for (uint8 i = 0; i < 15; i++) {
            xPositions[i] = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % 380 + 10);
        }
        
        // Generate matrix characters
        for (uint8 i = 0; i < 15; i++) {
            for (uint8 j = 0; j < 8; j++) {
                uint8 yPos = uint8(uint256(keccak256(abi.encodePacked(seed, i, j))) % 380 + 10);
                uint8 charCode = uint8(uint256(keccak256(abi.encodePacked(seed, i, j, "char"))) % 10 + 48); // 0-9
                
                // Animation delay
                uint8 delay = uint8(uint256(keccak256(abi.encodePacked(seed, i, j, "delay"))) % 5);
                
                chars = string(
                    abi.encodePacked(
                        chars,
                        '<text x="', uint2str(uint256(xPositions[i])), '" y="', uint2str(uint256(yPos)), 
                        '" class="matrix-char" style="animation-delay: ', uint2str(uint256(delay)), 's;">',
                        string(abi.encodePacked(bytes1(charCode))),
                        '</text>'
                    )
                );
            }
        }
        
        return string(abi.encodePacked(chars, '</g>'));
    }
    
    /**
     * @dev Generate collection SVG
     * @return svg The SVG string
     * @return encodedSvg Base64 encoded SVG with data URI
     */
    function generateCollectionSVG() public pure returns (string memory svg, string memory encodedSvg) {
        svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
                '<rect width="400" height="400" fill="#000"/>',
                '<filter id="glow">',
                '<feGaussianBlur stdDeviation="3.5" result="blur"/>',
                '<feComposite in="SourceGraphic" in2="blur" operator="over"/>',
                '</filter>',
                '<text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle" filter="url(#glow)">LuksoLoogies</text>',
                '<text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle" filter="url(#glow)">Matrix Edition</text>',
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
     * @dev Get token metadata in LUKSO LSP4 format
     * @param tokenId The token ID
     * @param loogieTypeValue The loogie type
     * @param colorBytes The color bytes
     * @param chubbiness The chubbiness value
     * @param mouthLength The mouth length value
     * @param username The username
     * @param isUP Whether the owner is a Universal Profile
     * @return raw Raw metadata bytes
     * @return encoded Encoded metadata bytes
     */
    function getMetadataBytes(
        bytes32 tokenId,
        string memory loogieTypeValue,
        bytes3 colorBytes,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username,
        bool isUP
    ) public view returns (bytes memory raw, bytes memory encoded) {
        // Generate SVG for token
        string memory svg = generateLoogieSVG(
            tokenId, 
            loogieTypeValue, 
            colorBytes, 
            chubbiness, 
            mouthLength, 
            username,
            isUP
        );
        
        // Get color hex
        string memory colorHex = toColorHexString(colorBytes);
        
        // Create token name and description
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(uint256(tokenId)).toString()));
        string memory description = string(
            abi.encodePacked(
                "This Matrix Loogie is the color #",
                colorHex,
                " with a chubbiness of ",
                uint2str(chubbiness),
                " and mouth length of ",
                uint2str(mouthLength),
                isUP ? ". Owned by a Universal Profile!" : "."
            )
        );
        
        // Format LSP4 metadata
        string memory metadata = string(abi.encodePacked(
            '{"LSP4Metadata": {"name": "', tokenName, 
            '","description": "', description, 
            '","links": [{"title":"Website","url":"https://luksoloogies.vercel.app"}],"icon":[],',
            '"images": [[{"width": 400,"height": 400,"url": "',
            'data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '"}]],',
            '"attributes":[',
            '{"key":"color","value":"#', colorHex, '","type":"string"},',
            '{"key":"chubbiness","value":', uint2str(chubbiness), ',"type":"number"},',
            '{"key":"mouthLength","value":', uint2str(mouthLength), ',"type":"number"},',
            '{"key":"username","value":"', username, '","type":"string"},',
            '{"key":"isUP","value":', isUP ? 'true' : 'false', ',"type":"boolean"},',
            '{"key":"type","value":"', loogieTypeValue, '","type":"string"}',
            ']}}'
        ));
        
        // Encode as raw bytes
        raw = bytes(metadata);
        
        // Encode the metadata with data URI
        encoded = bytes(string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(raw)
            )
        ));
        
        return (raw, encoded);
    }
    
    /**
     * @dev Get collection metadata in LUKSO LSP4 format
     * @param limit The token supply limit
     * @return raw Raw metadata bytes
     * @return encoded Encoded metadata bytes
     */
    function getCollectionMetadataBytes(uint256 limit) public pure returns (bytes memory raw, bytes memory encoded) {
        // Generate collection SVG
        (string memory collectionSvg, string memory encodedSvg) = generateCollectionSVG();
        
        // Format LSP4 metadata
        string memory metadata = string(abi.encodePacked(
            '{"LSP4Metadata":{',
            '"name":"LuksoLoogies",',
            '"description":"LuksoLoogies are LUKSO Standard LSP8 NFTs with a smile :) Only ', uint2str(limit), ' LuksoLoogies available on a price curve increasing 0.2% with each new mint. This Matrix Edition features animated Matrix-style designs for each Loogie.",',
            '"links":[{"title":"Website","url":"https://luksoloogies.vercel.app"},{"title":"Twitter","url":"https://twitter.com/luksoLoogies"}],',
            '"images":[[{"width":400,"height":400,"url":"', encodedSvg, '"}]],',
            // Collection-specific attributes
            '"attributes":[',
            '{"key":"type","value":"collection","type":"string"},',
            '{"key":"limit","value":', uint2str(limit), ',"type":"number"},',
            '{"key":"curve","value":100.2,"type":"number"}',
            ']',
            '}}'
        ));
        
        // Encode as raw bytes
        raw = bytes(metadata);
        
        // Encode the metadata with data URI
        encoded = bytes(string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(raw)
            )
        ));
        
        return (raw, encoded);
    }
}

/**
 * @title LSP8LoogiesEnhanced
 * @notice An LSP8 NFT contract for LuksoLoogies with improved SVG rendering and metadata
 */
contract LSP8LoogiesEnhanced is LSP8IdentifiableDigitalAsset, OnChainMetadata, ReentrancyGuard {
    using Strings for uint256;
    
    // Token attributes
    uint256 private _tokenIds;
    mapping(bytes32 => bytes3) public color;
    mapping(bytes32 => uint256) public chubbiness;
    mapping(bytes32 => uint256) public mouthLength;
    mapping(bytes32 => string) public loogieTypes;
    mapping(bytes32 => string) public upUsernames;
    
    // Collection constants
    uint256 public constant MAX_SUPPLY = 3728;
    uint256 public constant MAX_MINTABLE = 10;
    uint256 public constant PRICE = 0.1 ether;
    
    // Funds recipient
    address payable public constant recipient = payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);
    
    // Minting status
    bool public publicMintSet = false;
    
    // Store how many tokens each address has minted
    mapping(address => uint) public mintedPerAddress;
    
    // Events
    event UsernameUpdated(bytes32 indexed tokenId, string username);
    
    /**
     * @dev Constructor
     */
    constructor(address contractOwner) 
    LSP8IdentifiableDigitalAsset(
        "LuksoLoogies", 
        "LUKLOOG", 
        contractOwner, 
        2, // Collection type (2)
        0 // Token ID format (0)
    ) {
        // Initialize loogieTypes data
        string[] memory types = new string[](5);
        types[0] = "green";
        types[1] = "blue";
        types[2] = "red";
        types[3] = "purple";
        types[4] = "yellow";
        _setUp("types", types);
        
        // Set up collection metadata - must be done in the constructor
        (bytes memory rawMetadata, bytes memory encodedMetadata) = getCollectionMetadataBytes(MAX_SUPPLY);
        bytes memory verifiableURI = bytes.concat(
            hex"00006f357c6a0020",
            keccak256(rawMetadata),
            encodedMetadata
        );
        _setData(_LSP4_METADATA_KEY, verifiableURI);
        
        // Set collection supply data
        bytes32 LSP4_METADATA_TOTAL_SUPPLY = 0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f;
        _setData(LSP4_METADATA_TOTAL_SUPPLY, bytes.concat(bytes32(uint256(MAX_SUPPLY))));
        
        bytes32 LSP4_METADATA_MAX_SUPPLY = 0xd28c95357cf4c94d638a4f572d5d3df8d7e1415c8b650e747a219c559d1435c8;
        _setData(LSP4_METADATA_MAX_SUPPLY, bytes.concat(bytes32(uint256(MAX_SUPPLY))));
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Get token supply cap
     */
    function tokenSupplyCap() public view virtual returns (uint256) {
        return MAX_SUPPLY;
    }
    
    /**
     * @dev Set minting status
     */
    function setMintStatus(bool _publicMintSet) external onlyOwner {
        publicMintSet = _publicMintSet;
    }
    
    /**
     * @dev Mint with custom username
     */
    function mintItemWithUsername(string memory _username) public payable nonReentrant returns (bytes32) {
        require(publicMintSet, "Public minting is closed");
        require(_tokenIds < MAX_SUPPLY, "DONE MINTING");
        require(msg.value >= PRICE, "NOT ENOUGH");
        require(mintedPerAddress[msg.sender] < MAX_MINTABLE, "MINT LIMIT REACHED");
        
        // Increment minted count for this address
        mintedPerAddress[msg.sender]++;
        
        // Mint token
        _tokenIds++;
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        
        // Generate random attributes
        bytes32 predictableRandom = keccak256(
            abi.encodePacked(
                tokenId,
                blockhash(block.number - 1),
                msg.sender,
                address(this)
            )
        );
        
        // Set token attributes through mintAndGenerate with custom username
        mintAndGenerateWithUsername(msg.sender, tokenId, predictableRandom, _username);
        
        // Send funds to recipient
        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");
        
        return tokenId;
    }
    
    /**
     * @dev Mint with auto-detected username for UP
     */
    function mintItem() public payable nonReentrant returns (bytes32) {
        require(publicMintSet, "Public minting is closed");
        require(_tokenIds < MAX_SUPPLY, "DONE MINTING");
        require(msg.value >= PRICE, "NOT ENOUGH");
        require(mintedPerAddress[msg.sender] < MAX_MINTABLE, "MINT LIMIT REACHED");
        
        // Increment minted count for this address
        mintedPerAddress[msg.sender]++;
        
        // Mint token
        _tokenIds++;
        bytes32 tokenId = bytes32(uint256(_tokenIds));
        
        // Generate random attributes
        bytes32 predictableRandom = keccak256(
            abi.encodePacked(
                tokenId,
                blockhash(block.number - 1),
                msg.sender,
                address(this)
            )
        );
        
        // Try to get UP name if minter is a Universal Profile
        string memory upName = "";
        if (isUniversalProfile(msg.sender)) {
            upName = getUPName(msg.sender);
            if (bytes(upName).length == 0) {
                upName = "UP Owner";
            }
        } else {
            upName = "luksonaut";
        }
        
        // Set token attributes through mintAndGenerate
        mintAndGenerateWithUsername(msg.sender, tokenId, predictableRandom, upName);
        
        // Send funds to recipient
        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");
        
        return tokenId;
    }
    
    /**
     * @dev Mint token and generate attributes with username
     */
    function mintAndGenerateWithUsername(address _to, bytes32 _tokenId, bytes32 _randomSeed, string memory _username) internal {
        // Set token attributes
        color[_tokenId] = bytes2(_randomSeed[0]) |
            (bytes2(_randomSeed[1]) >> 8) |
            (bytes3(_randomSeed[2]) >> 16);
            
        chubbiness[_tokenId] = 35 + ((55 * uint256(uint8(_randomSeed[3]))) / 255);
        
        mouthLength[_tokenId] = 180 + ((uint256(chubbiness[_tokenId] / 4) * uint256(uint8(_randomSeed[4]))) / 255);
        
        // Randomly assign loogie type
        uint256 typeIndex = uint256(uint8(_randomSeed[5])) % 5;
        if (typeIndex == 0) loogieTypes[_tokenId] = "green";
        else if (typeIndex == 1) loogieTypes[_tokenId] = "blue";
        else if (typeIndex == 2) loogieTypes[_tokenId] = "red";
        else if (typeIndex == 3) loogieTypes[_tokenId] = "purple";
        else loogieTypes[_tokenId] = "yellow";
        
        // Set username
        upUsernames[_tokenId] = _username;
        
        // Mint the token
        _mint(_to, _tokenId, true, "");
    }
    
    // For backward compatibility
    function mintAndGenerate(address _to, bytes32 _tokenId, bytes32 _randomSeed) internal {
        // Get UP name if possible
        string memory upName = "";
        if (isUniversalProfile(_to)) {
            upName = getUPName(_to);
            if (bytes(upName).length == 0) {
                upName = "UP Owner";
            }
        } else {
            upName = "luksonaut";
        }
        
        mintAndGenerateWithUsername(_to, _tokenId, _randomSeed, upName);
    }
    
    /**
     * @dev Set username for token
     */
    function setUsername(bytes32 tokenId, string memory username) public {
        require(tokenOwnerOf(tokenId) == msg.sender, "Not token owner");
        upUsernames[tokenId] = username;
        emit UsernameUpdated(tokenId, username);
    }
    
    /**
     * @dev Withdraw funds
     */
    function withdraw(address payable _to) external onlyOwner {
        _to.transfer(address(this).balance);
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
        string memory _loogieType = loogieTypes[tokenId];
        bytes3 colorValue = color[tokenId];
        uint256 chubbinessValue = chubbiness[tokenId];
        uint256 mouthLengthValue = mouthLength[tokenId];
        string memory username = upUsernames[tokenId];
        
        // Check if owner is a Universal Profile
        address owner = tokenOwnerOf(tokenId);
        bool isUP = isUniversalProfile(owner);
        
        // Get metadata in LUKSO format
        (bytes memory _metadata, bytes memory _encoded) = getMetadataBytes(
            tokenId,
            _loogieType,
            colorValue,
            chubbinessValue,
            mouthLengthValue,
            username,
            isUP
        );
        
        // Return in LUKSO format with verification
        bytes memory verifiableURI = bytes.concat(
            hex"00006f357c6a0020",
            keccak256(_metadata),
            _encoded
        );
        
        return verifiableURI;
    }
} 