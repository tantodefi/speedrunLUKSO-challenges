// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OnChainMetadata
 * @notice Handles on-chain SVG generation and metadata formatting for LSP8Loogies
 * @dev Provides SVG generation and properly formatted LSP4 metadata
 */
contract OnChainMetadata {
    using Strings for uint256;

    // Storage for metadata components
    mapping(string => string[]) private _parts;

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
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _parts["types"].length;
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
     * @return string The complete SVG
     */
    function generateLoogieSVG(
        bytes32 tokenId,
        string memory loogieType,
        bytes3 colorValue,
        uint256 chubbinessValue,
        uint256 mouthLengthValue,
        string memory username
    ) public view returns (string memory) {
        // Determine body color based on loogie type
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
            bodyColor = string(abi.encodePacked("#", toColorHexString(colorValue)));
        }
        
        // Generate Matrix Theme SVG with original Loogies shapes
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
                '<defs>',
                '<style>',
                '@font-face {font-family: "Comic Sans MS"; src: url("https://fonts.cdnfonts.com/css/comic-sans");}',
                '.username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; }',
                '.matrix-char { font-family: monospace; fill: #0F0; opacity: 0.3; }',
                '@keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }',
                '@keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }',
                '</style>',
                generateMatrixRainEffect(tokenId),
                '</defs>',
                '<rect width="400" height="400" fill="#000000"/>',
                '<g class="matrix-background">',
                generateRandomMatrixChars(tokenId),
                '</g>',
                '<g class="loogie-container">',
                '<ellipse cx="200" cy="200" rx="70" ry="', uint2str(chubbinessValue), 
                '" fill="', bodyColor, '" stroke="#000000" stroke-width="3"/>',
                '<circle cx="170" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>',
                '<circle cx="230" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>',
                '<circle cx="170" cy="180" r="5" fill="#000000"/>',
                '<circle cx="230" cy="180" r="5" fill="#000000"/>',
                '<path d="M ', uint2str(200 - mouthLengthValue/2), ' 220 Q 200 240 ', 
                uint2str(200 + mouthLengthValue/2), ' 220" fill="none" stroke="#000000" stroke-width="3"/>',
                '<text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">',
                username,
                '</text>',
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
                '<feGaussianBlur stdDeviation="2" result="blur"/>',
                '<feComposite in="SourceGraphic" in2="blur" operator="over"/>',
                '</filter>'
            )
        );
    }
    
    /**
     * @dev Generate random Matrix characters for background
     */
    function generateRandomMatrixChars(bytes32 seed) internal pure returns (string memory) {
        string memory chars = "";
        uint8[10] memory xPositions;
        
        // Generate random x positions for matrix columns
        for (uint8 i = 0; i < 10; i++) {
            xPositions[i] = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % 380 + 10);
        }
        
        // Generate matrix characters
        for (uint8 i = 0; i < 10; i++) {
            for (uint8 j = 0; j < 5; j++) {
                uint8 yPos = uint8(uint256(keccak256(abi.encodePacked(seed, i, j))) % 380 + 10);
                uint8 charCode = uint8(uint256(keccak256(abi.encodePacked(seed, i, j, "char"))) % 10 + 48); // 0-9
                
                // Animation delay
                uint8 delay = uint8(uint256(keccak256(abi.encodePacked(seed, i, j, "delay"))) % 5);
                
                chars = string(
                    abi.encodePacked(
                        chars,
                        '<text x="', uint2str(uint256(xPositions[i])), '" y="', uint2str(uint256(yPos)), 
                        '" class="matrix-char" style="animation: fade 3s infinite, fall 8s linear infinite ',
                        uint2str(uint256(delay)), 's;">',
                        string(abi.encodePacked(bytes1(charCode))),
                        '</text>'
                    )
                );
            }
        }
        
        return chars;
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
     * @return raw Raw metadata bytes
     * @return encoded Encoded metadata bytes
     */
    function getMetadataBytes(
        bytes32 tokenId,
        string memory loogieTypeValue,
        bytes3 colorBytes,
        uint256 chubbiness,
        uint256 mouthLength,
        string memory username
    ) public view returns (bytes memory raw, bytes memory encoded) {
        // Generate SVG for token
        string memory svg = generateLoogieSVG(
            tokenId, 
            loogieTypeValue, 
            colorBytes, 
            chubbiness, 
            mouthLength, 
            username
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
                "."
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
            '"name":"LuksoLoogies Matrix",',
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
    
    /**
     * @dev Constructor
     */
    constructor(address contractOwner) 
    LSP8IdentifiableDigitalAsset(
        "LuksoLoogies Matrix", 
        "LUKSLOGMTX", 
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
     * @dev Public mint with payment
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
        
        // Set token attributes through mintAndGenerate
        mintAndGenerate(msg.sender, tokenId, predictableRandom);
        
        // Send funds to recipient
        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");
        
        return tokenId;
    }
    
    /**
     * @dev Mint for team use
     */
    function teamMint(address receiver, uint256 _amount) external onlyOwner {
        uint256 _totalSupply = totalSupply();
        require(_totalSupply + _amount <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < _amount; i++) {
            _tokenIds++;
            bytes32 tokenId = bytes32(uint256(_tokenIds));
            
            // Generate random seed
            bytes32 predictableRandom = keccak256(
                abi.encodePacked(
                    tokenId,
                    blockhash(block.number - 1),
                    receiver,
                    address(this),
                    i
                )
            );
            
            mintAndGenerate(receiver, tokenId, predictableRandom);
        }
    }
    
    /**
     * @dev Mint token and generate attributes
     */
    function mintAndGenerate(address _to, bytes32 _tokenId, bytes32 _randomSeed) internal {
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
        
        // Set default username
        upUsernames[_tokenId] = "luksonaut";
        
        // Mint the token
        _mint(_to, _tokenId, true, "");
    }
    
    /**
     * @dev Set username for token
     */
    function setUsername(bytes32 tokenId, string memory username) public {
        require(tokenOwnerOf(tokenId) == msg.sender, "Not token owner");
        upUsernames[tokenId] = username;
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
        
        // Get metadata in LUKSO format
        (bytes memory _metadata, bytes memory _encoded) = getMetadataBytes(
            tokenId,
            _loogieType,
            colorValue,
            chubbinessValue,
            mouthLengthValue,
            username
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