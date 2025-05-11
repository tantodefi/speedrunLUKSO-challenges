// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title ILSP3Profile Interface
 * @dev Interface for the LSP3 Profile standard
 */
interface ILSP3Profile {
    /**
     * @dev Returns the name associated with the Universal Profile
     */
    function getName() external view returns (string memory);
} 