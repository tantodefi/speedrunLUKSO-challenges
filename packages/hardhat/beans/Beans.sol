// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/*
*
                                                                                
            #######                                    
            #######                                    
            #######                                    
    ,#######                                           
    ,#######                                           
    ,#######                                           
            ///////                                    
            ///////                                    
            ///////                                    
    .. ..................                             
     . . . . . . . . . .                              
    .. ..................                             
    .. ............... ...,,,,,,,                     
    .. ...................,,,,,,,                     
    .. ....... ....... ...,,,,,,,                     
    .. ...................,,,,,,,                     
    .. ............... ...,,,,,,,                     
    .. ...................,,,,,,,                     
    .. ... ... ... ... ..                             
    .. ..................                             
    .. ............... ..                             
                                                                                                                                                                                                             
*
* Celebrate Being UP Early. Get in your GM beans
*/
/// @author Aure (aurelianoa, @aurealarcon)
/// @author JAK (@JakGrills)
/// @author GEM (@metagema)
/// @title CupCoAllowList
/// @notice Allowlist for CupCo
/// @dev This contract is used to mint Gm Beans NFTs As LSP8s
import { OnChainMetadata } from "./OnChainMetadata.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {
    LSP8IdentifiableDigitalAsset
    } from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
interface ICupCoAllowList {
    function isListed(address _address) external returns (bool);
}
contract Beans is LSP8IdentifiableDigitalAsset, OnChainMetadata, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 4200;
    uint256 public constant MAX_MINTABLE = 10;
    uint256 public constant MAX_MINTABLE_ALLOWLIST = 2;
    uint256 public constant PRICE = 1 ether;
    uint256 public constant PRICE_ALLOWLIST = 0.75 ether;
    address public allowList = address(0);
    address public authorizedAgent = address(0);
    bool public allowListMintSet = false;
    bool public publicMintSet = false;
    
    mapping (address => uint) public publicMintedAddress;
    mapping (address => uint) public allowListMintedAddress;
    mapping (bytes32 => string) public beanTypes;

    /// errors
    error BeansMintingLimitExceeded(uint256 _amount);
    error BeansMintingPriceNotMet(uint256 _amount);
    error NotAllowListed(address _address);
    error NoAllowListSet();
    error Unauthorized();
   
    /// @dev Modifier to ensure caller is authorized operator
    modifier onlyAuthorizedAgent() {
        if (msg.sender != authorizedAgent && msg.sender != owner()) {
            revert Unauthorized();
        }
        _;
    }

    constructor(address _allowList) LSP8IdentifiableDigitalAsset("GM Beans", "GMBEANS", msg.sender, 1, 0)  {
        if(_allowList == address(0)) revert NoAllowListSet();
        allowList = _allowList;
        authorizedAgent = msg.sender;
    }
    /// @notice team mint
    /// @param _amount The amount of tokens to mint
    function teamMint(address receiver, uint256 _amount) external onlyAuthorizedAgent {
        uint256 _totalSupply = totalSupply();
        if(_totalSupply + _amount > MAX_SUPPLY) revert BeansMintingLimitExceeded(_amount);
        for (uint256 i = 0; i < _amount; i++) {
            uint256 tokenId = ++_totalSupply;
            mintAndGenerate(receiver, tokenId);
        }
    }
    /// @notice AllowList Mint
    /// @param _amount The amount of tokens to mint
    function allowListMint(uint256 _amount) external payable nonReentrant {
        require(allowListMintSet, "AllowList minting is closed");
        uint256 _totalSupply = totalSupply();
        if(_totalSupply + _amount > MAX_SUPPLY) revert BeansMintingLimitExceeded(_amount);
        if(allowListMintedAddress[msg.sender] + _amount > MAX_MINTABLE_ALLOWLIST) revert BeansMintingLimitExceeded(_amount);
        if(msg.value != _amount*PRICE_ALLOWLIST) revert BeansMintingPriceNotMet(_amount);
        ICupCoAllowList allowListContract = ICupCoAllowList(allowList);
        if(!allowListContract.isListed(msg.sender)) revert NotAllowListed(msg.sender);
        for (uint256 i = 0; i < _amount; i++) {
            uint256 tokenId = ++_totalSupply;
            mintAndGenerate(msg.sender, tokenId);
        }
        allowListMintedAddress[msg.sender] += _amount;
    }
    /// @param _amount The amount of tokens to mint
    function publicMint(uint256 _amount) external payable nonReentrant {
        require(publicMintSet, "Public minting is closed");
        uint256 _totalSupply = totalSupply();
        if(_totalSupply + _amount > MAX_SUPPLY) revert BeansMintingLimitExceeded(_amount);
        if(publicMintedAddress[msg.sender] + _amount > MAX_MINTABLE) revert BeansMintingLimitExceeded(_amount);
        if(msg.value != _amount*PRICE) revert BeansMintingPriceNotMet(_amount);
        for (uint256 i = 0; i < _amount; i++) {
            uint256 tokenId = ++_totalSupply;
            mintAndGenerate(msg.sender, tokenId);
        }
        publicMintedAddress[msg.sender] += _amount;
    }
    /// @notice Mint a token and generate the metadata
    /// @param _to The address of the token receiver
    /// @param _tokenId The token id
    function mintAndGenerate(address _to, uint256 _tokenId) internal {
        bytes32 _bytes32TokenId = bytes32(_tokenId);
        _mint(_to, _bytes32TokenId, false, "");
        string memory _beanType = getRandomBean();
        beanTypes[_bytes32TokenId] = _beanType;        
    }
    /// @notice Set Minting Status
    /// @param _allowListMintSet bool
    /// @param _publicMintSet bool
    function setMintStatus(bool _allowListMintSet, bool _publicMintSet) external onlyAuthorizedAgent {
        allowListMintSet = _allowListMintSet;
        publicMintSet = _publicMintSet;
    }
    /// withdraw funds from the contract
    /// @param _to address
    function withdraw(address payable _to) external onlyAuthorizedAgent {
        _to.transfer(address(this).balance);
    }
    /// @notice setup the metadata
    /// @param _index The index of the metadata
    /// @param data The metadata
    function setUp(string memory _index, string[] memory data) external onlyAuthorizedAgent {
        _setUp(_index, data);
    }
    /// @notice retrieves the supply cap
    /// @return uint256
    function tokenSupplyCap() public view virtual returns (uint256) {
        return MAX_SUPPLY;
    }
    function setAuthorizedAgent(address _authorizedAgent) external onlyOwner {
        authorizedAgent = _authorizedAgent;
    }
    /// override
    function _getDataForTokenId(
        bytes32 tokenId,
        bytes32 dataKey
    ) internal view virtual override returns (bytes memory dataValues) {
        /// @dev Override only if asking for LSP4Metadata
        if(dataKey != 0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e) {
            return _store[keccak256(bytes.concat(tokenId, dataKey))];
        }
        string memory _beanType = beanTypes[tokenId];
        (bytes memory _metadata, bytes memory _encoded) = getMetadataBytes(_beanType);
        bytes memory verfiableURI = bytes.concat(
            hex'00006f357c6a0020',
            keccak256(_metadata),
            _encoded
        );
        return verfiableURI;
    }
    
}

