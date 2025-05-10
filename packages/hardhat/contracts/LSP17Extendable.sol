// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import {_INTERFACEID_LSP17_EXTENDABLE} from "./LSP17Constants.sol";

// errors
import {NoExtensionFoundForFunctionSelector} from "./LSP17Errors.sol";

/**
 * @title Module to add more functionalities to a contract using extensions.
 *
 * @dev Implementation of the `fallback(...)` logic according to LSP17 - Contract Extension standard.
 * This module can be inherited to extend the functionality of the parent contract when
 * calling a function that doesn't exist on the parent contract via forwarding the call
 * to an extension mapped to the function selector being called, set originally by the parent contract
 */
abstract contract LSP17Extendable is ERC165 {
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP17_EXTENDABLE ||
            super.supportsInterface(interfaceId);
    }

    function _supportsInterfaceInERC165Extension(
        bytes4 interfaceId
    ) internal view virtual returns (bool) {
        (address erc165Extension, ) = _stubbedGetExtensionAndForwardValue(
            ERC165.supportsInterface.selector
        );
        if (erc165Extension == address(0)) return false;

        return
            ERC165Checker.supportsERC165InterfaceUnchecked(
                erc165Extension,
                interfaceId
            );
    }
    // Minimal stub for vendored build
    function _stubbedGetExtensionAndForwardValue(bytes4) private pure returns (address, uint256) {
        return (address(0), 0);
    }
}

