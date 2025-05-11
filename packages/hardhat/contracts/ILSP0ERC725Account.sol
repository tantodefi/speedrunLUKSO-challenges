// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title ILSP0ERC725Account Interface
 * @dev Minimal interface for the LSP0 ERC725 Account standard
 */
interface ILSP0ERC725Account {
    /**
     * @dev Checks if a signature is valid for the given data
     * @param dataHash The hash of the data signed
     * @param signature The signature to verify
     * @return The magic value 0x1626ba7e if valid
     */
    function isValidSignature(bytes32 dataHash, bytes memory signature) external view returns (bytes4);
    
    /**
     * @dev Gets data for a specific key
     * @param dataKey The key to query
     * @return The stored data bytes
     */
    function getData(bytes32 dataKey) external view returns (bytes memory);
} 