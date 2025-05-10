// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

error NoExtensionFoundForFunctionSelector(bytes4 functionSelector);
error InvalidFunctionSelector(bytes data);
error InvalidExtensionAddress(bytes storedData);
