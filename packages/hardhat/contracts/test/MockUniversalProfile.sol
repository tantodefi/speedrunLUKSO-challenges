// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title MockUniversalProfile
 * @dev A simplified mock of a Universal Profile that implements the necessary interface IDs
 * for testing UP detection in LSP8Loogies.
 */
contract MockUniversalProfile is ERC165 {
    // LSP interface IDs
    bytes4 constant _INTERFACEID_LSP0 = 0x3a271fff;
    bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;
    bytes4 constant _INTERFACEID_LSP3 = 0x6f9fcd35;
    
    // Mock data storage
    mapping(bytes32 => bytes) private _data;
    string private _name = "LuksoUP";

    constructor() {
        // Pre-populate the LSP3 name
        _data[keccak256("LSP3Profile_Name")] = bytes(_name);
    }

    // Override supportsInterface to indicate this contract supports LSP interfaces
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return 
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP3 ||
            super.supportsInterface(interfaceId); // This includes ERC165 support
    }
    
    // LSP3 function to get profile name
    function getName() external view returns (string memory) {
        return _name;
    }
    
    // ERC725Y data access
    function getData(bytes32 key) external view returns (bytes memory) {
        return _data[key];
    }
    
    function setData(bytes32 key, bytes memory value) external {
        _data[key] = value;
    }
    
    // Implement isValidSignature for controller check
    function isValidSignature(bytes32 hash, bytes memory signature) external pure returns (bytes4) {
        // Mock implementation that always returns success
        return 0x1626ba7e; // Magic value for ERC1271
    }

    // Dummy functions to receive ETH and tokens
    receive() external payable {}
    fallback() external payable {}
} 