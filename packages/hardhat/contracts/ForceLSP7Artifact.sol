// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";
contract ForceLSP7Artifact is LSP7DigitalAsset {
    constructor() LSP7DigitalAsset("Dummy", "DUM", msg.sender, 0, false) {}
}
