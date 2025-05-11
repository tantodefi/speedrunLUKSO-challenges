// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@lukso/lsp2-contracts/contracts/LSP2Utils.sol";
import "./ILSP0ERC725Account.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import "./ILSP3Profile.sol";
import "./LSP4Constants.sol";

import "./HexStrings.sol";
import "./ToColor.sol";
// Patch for LUKSO v0.16.x compatibility
library LSP8CompatPatch {
    bytes4 constant LSP8_TOKENID_FORMAT_NUMBER = 0x00000000;
}

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
    // Store UP usernames for each token
    mapping(bytes32 => string) public upUsernames;

    // all funds go to buidlguidl.eth (same as in YourCollectible)
    address payable public constant recipient =
        payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);

    uint256 public constant limit = 3728;
    uint256 public constant curve = 1002; // price increase 0,4% with each purchase
    uint256 public price = 0.001 ether;
    // the 1154th lukso loogies cost 0.01 LYX, the 2306th cost 0.1 LYX, the 3459th cost 1 LYX and the last ones cost 1.7 LYX

    // LSP1 Universal Receiver interface ID to detect Universal Profiles
    bytes4 constant _INTERFACEID_LSP0 = 0x3a271fff;
    
    constructor(
        address contractOwner
    ) LSP8IdentifiableDigitalAsset(
        "LuksoLoogies", 
        "LUKLOOG", 
        contractOwner, 
        1, 
        uint256(uint32(LSP8CompatPatch.LSP8_TOKENID_FORMAT_NUMBER))
    ) {}

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

        _mint(msg.sender, tokenId, true, "");

        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");

        return tokenId;
    }

    // Add batch mint function to mint multiple tokens at once
    function batchMintItems(uint256 count) public payable returns (bytes32[] memory) {
        require(count > 0, "Count must be greater than 0");
        require(_tokenIds + count <= limit, "EXCEEDS LIMIT");
        
        // Calculate total price for all tokens with the increasing curve
        uint256 totalPrice = 0;
        uint256 currentPrice = price;
        
        for (uint256 i = 0; i < count; i++) {
            totalPrice += currentPrice;
            currentPrice = (currentPrice * curve) / 1000;
        }
        
        require(msg.value >= totalPrice, "NOT ENOUGH");
        
        // Store the new tokens
        bytes32[] memory tokenIds = new bytes32[](count);
        
        // Mint each token
        for (uint256 i = 0; i < count; i++) {
            _tokenIds += 1;
            bytes32 tokenId = bytes32(uint256(_tokenIds));
            _tokenIdExists[_tokenIds] = true;
            
            bytes32 predictableRandom = keccak256(
                abi.encodePacked(
                    tokenId,
                    blockhash(block.number - 1),
                    msg.sender,
                    address(this),
                    i // Add index to ensure uniqueness within the batch
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
            
            _mint(msg.sender, tokenId, true, "");
            tokenIds[i] = tokenId;
            
            // Update price for next iteration
            price = (price * curve) / 1000;
        }
        
        // Send funds to recipient
        (bool success, ) = recipient.call{ value: msg.value }("");
        require(success, "could not send");
        
        return tokenIds;
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

        _mint(to, tokenId, true, "");
        return tokenId;
    }

    // Add function to set UP username for a token
    function setUPUsername(bytes32 tokenId, string memory username) public {
        address tokenOwner = tokenOwnerOf(tokenId);
        require(tokenOwner == msg.sender || 
                (isUniversalProfile(tokenOwner) && isControllerOf(tokenOwner, msg.sender)), 
                "LSP8: Not authorized");
        upUsernames[tokenId] = username;
    }

    // Helper function to check if an address is a controller of a UP
    function isControllerOf(address universalProfile, address /* controller */) internal view returns (bool) {
        try ILSP0ERC725Account(universalProfile).isValidSignature(
            bytes32(uint256(0x12345678)),
            abi.encodePacked(bytes4(0x1626ba7e))
        ) returns (bytes4) {
            return true;
        } catch {
            return false;
        }
    }

    // Function to try to get a username from UP metadata
    function getUPName(address upAddress) public view returns (string memory) {
        if (!isUniversalProfile(upAddress)) {
            return "luksonaut";
        }
        
        try ILSP3Profile(upAddress).getName() returns (string memory profileName) {
            if (bytes(profileName).length > 0) {
                return profileName;
            }
        } catch {}
        
        // Try ERC725Y data fetching as fallback
        try ILSP0ERC725Account(upAddress).getData(keccak256("LSP3Profile_Name")) returns (bytes memory data) {
            if (data.length > 0) {
                return string(data);
            }
        } catch {}
        
        return "luksonaut";
    }

    // Helper function to check if a token exists by its uint256 ID
    function tokenExists(uint256 id) public view returns (bool) {
        return _tokenIdExists[id];
    }

    // Import legacy tokens from previous contract deployment
    function importLegacyTokens(uint256[] calldata tokenIds, address[] calldata owners, bytes3[] calldata tokenColors, uint256[] calldata tokenChubbiness, uint256[] calldata tokenMouthLength, string[] calldata tokenUsernames) public {
        require(msg.sender == owner(), "LSP8: Caller is not the contract owner");
        require(tokenIds.length == owners.length && tokenIds.length == tokenColors.length && tokenIds.length == tokenChubbiness.length && tokenIds.length == tokenMouthLength.length && tokenIds.length == tokenUsernames.length, "LSP8: Array lengths mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            bytes32 tokenIdBytes = bytes32(tokenId);
            
            // Skip if token already exists in this contract
            if (_tokenIdExists[tokenId]) continue;
            
            // Record this token ID
            _tokenIdExists[tokenId] = true;
            
            // Record token metadata
            color[tokenIdBytes] = tokenColors[i];
            chubbiness[tokenIdBytes] = tokenChubbiness[i];
            mouthLength[tokenIdBytes] = tokenMouthLength[i];
            upUsernames[tokenIdBytes] = tokenUsernames[i];
            
            // Update _tokenIds if this is higher than current value
            if (tokenId > _tokenIds) {
                _tokenIds = tokenId;
            }
        }
    }
    
    // Simplified import for just recording token IDs and owners
    function importLegacyTokensSimple(uint256[] calldata tokenIds, address[] calldata owners) public {
        require(msg.sender == owner(), "LSP8: Caller is not the contract owner");
        require(tokenIds.length == owners.length, "LSP8: Array lengths mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            bytes32 tokenIdBytes = bytes32(tokenId);
            
            // Skip if token already exists in this contract
            if (_tokenIdExists[tokenId]) continue;
            
            // Record this token ID
            _tokenIdExists[tokenId] = true;
            
            // Record minimal default metadata
            color[tokenIdBytes] = bytes3(0x000000);  // Default black
            chubbiness[tokenIdBytes] = 60;  // Default value 
            mouthLength[tokenIdBytes] = 230;  // Default value
            upUsernames[tokenIdBytes] = "luksonaut";  // Default username
            
            // Update _tokenIds if this is higher than current value
            if (tokenId > _tokenIds) {
                _tokenIds = tokenId;
            }
        }
    }

    // Batch check if multiple tokens exist
    function batchTokenExists(uint256[] memory ids) public view returns (bool[] memory) {
        bool[] memory results = new bool[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            results[i] = _tokenIdExists[ids[i]];
        }
        
        return results;
    }

    // Get all token IDs that have been minted, for display compatibility
    function getAllTokenIds() public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](_tokenIds);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_tokenIdExists[i]) {
                ids[counter] = i;
                counter++;
            }
        }
        
        return ids;
    }

    // Get token IDs with pagination support
    function getTokenIdsPaginated(uint256 offset, uint256 pageSize) public view returns (uint256[] memory) {
        uint256 totalCount = _tokenIds;
        
        // Adjust pageSize if it exceeds the available tokens
        if (offset >= totalCount) {
            return new uint256[](0);
        }
        
        uint256 endIndex = offset + pageSize;
        if (endIndex > totalCount) {
            endIndex = totalCount;
        }
        
        uint256 resultLength = 0;
        // First count how many existing tokens are in the range
        for (uint256 i = offset + 1; i <= endIndex; i++) {
            if (_tokenIdExists[i]) {
                resultLength++;
            }
        }
        
        // Then create and fill the result array
        uint256[] memory result = new uint256[](resultLength);
        uint256 resultIndex = 0;
        
        for (uint256 i = offset + 1; i <= endIndex; i++) {
            if (_tokenIdExists[i]) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        return result;
    }

    function tokenURI(bytes32 tokenId) public view returns (string memory) {
        require(tokenOwnerOf(tokenId) != address(0), "LSP8: Token does not exist");
        string memory tokenName = string(abi.encodePacked("Loogie #", uint256(tokenId).toString()));
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
                            tokenName,
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
                            '},{"trait_type": "upUsername", "value": "',
                            upUsernames[tokenId],
                            '"}], "owner":"',
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
        address owner = tokenOwnerOf(tokenId);
        bool isUP = isUniversalProfile(owner);
        
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
                generateMatrixRainEffect(tokenId),
                '</g>',
                // Add a slightly transparent background for the Loogie to make it stand out
                '<g class="loogie-container">',
                '<ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)" filter="blur(20px)" />',
                renderTokenById(tokenId),
                '</g>',
                "</svg>"
            )
        );
        return svg;
    }

    function generateMatrixRainEffect(bytes32 tokenId) internal pure returns (string memory) {
        // Generate pseudo-random characters for matrix effect based on tokenId
        bytes32 predictableRandom = keccak256(abi.encodePacked(tokenId, "matrix"));
        string memory matrixElements = "";
        
        // Generate 200 matrix "drops" with characters (increased for more density)
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

    function renderTokenById(bytes32 tokenId) public view returns (string memory) {
        address owner = tokenOwnerOf(tokenId);
        string memory username;
        
        // If the owner is a Universal Profile, try to get the actual name from the UP
        if (isUniversalProfile(owner)) {
            username = getUPName(owner);
        } else {
            // Otherwise use the stored username or default
            username = upUsernames[tokenId];
            if (bytes(username).length == 0) {
                username = "luksonaut";
            }
        }
        
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
                uint2str(uint256((810 - 9 * uint256(chubbiness[tokenId])) / 11)),
                ',0)">',
                '<path d="M 130 240 Q 165 250 ',
                uint2str(mouthLength[tokenId]),
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

    // Check if an address is likely a Universal Profile
    function isUniversalProfile(address account) public view returns (bool) {
        // Using a try-catch because the call might revert on non-contract addresses
        try this.supportsERC165InterfaceUnchecked(account, _INTERFACEID_LSP0) returns (bool supportsLSP0) {
            if (supportsLSP0) {
                try this.supportsERC165InterfaceUnchecked(account, _INTERFACEID_LSP1) returns (bool supportsLSP1) {
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
    
    // External function that allows checking interface support without reverting
    function supportsERC165InterfaceUnchecked(address account, bytes4 interfaceId) external view returns (bool) {
        // First check ERC165 support
        try IERC165(account).supportsInterface(0x01ffc9a7) returns (bool supportsERC165) {
            if (!supportsERC165) {
                return false;
            }
            // Then check the specific interface
            try IERC165(account).supportsInterface(interfaceId) returns (bool supportsInterface) {
                return supportsInterface;
            } catch {
                return false;
            }
        } catch {
            return false;
        }
    }
}
