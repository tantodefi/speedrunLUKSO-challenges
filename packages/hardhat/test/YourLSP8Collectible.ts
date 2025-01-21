import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { YourLSP8Collectible } from "../typechain-types";

describe("YourLSP8Collectible", function () {
  let nftContract: YourLSP8Collectible;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const YourLSP8Collectible = await ethers.getContractFactory("YourLSP8Collectible");
    nftContract = await YourLSP8Collectible.deploy("SVG NFT", "SVGNFT", owner.address);
    await nftContract.deployed();
  });

  describe("Minting", function () {
    it("Should mint NFT with correct tokenURI", async function () {
      const tokenURI = "data:image/svg+xml;base64,...";
      const tx = await nftContract.mintItem(addr1.address, tokenURI);
      const receipt = await tx.wait();
      
      // Get the tokenId from events
      const mintEvent = receipt.events?.find(e => e.event === "Transfer");
      const tokenId = mintEvent?.args?.tokenId;

      expect(await nftContract.tokenURI(tokenId)).to.equal(tokenURI);
      expect(await nftContract.tokenOwnerOf(tokenId)).to.equal(addr1.address);
    });
  });

  // Add more tests for LSP8-specific features
}); 