import { ethers } from "hardhat";
import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";
import { LSP4MetadataBeacon } from "@lukso/lsp-smart-contracts/dist/types";

async function main() {
  const [deployer] = await ethers.getSigners();
  const contractAddress = "YOUR_CONTRACT_ADDRESS";
  const contract = await ethers.getContractAt("YourLSP8Collectible", contractAddress);

  // Encode collection metadata
  const metadata = {
    name: "SVG NFT Collection",
    description: "Dynamic SVG NFTs on LUKSO",
    links: [{
      title: "Website",
      url: "https://your-website.com"
    }],
    images: [{
      width: 1000,
      height: 1000,
      url: "ipfs://your-collection-image-hash",
    }],
  };

  // Set collection metadata
  await contract.setData(
    ERC725YDataKeys.LSP4.LSP4Metadata,
    LSP4MetadataBeacon.encodeMetadata(metadata)
  );

  // Set creator information
  await contract.setDataBatch(
    [
      ERC725YDataKeys.LSP4["LSP4Creators[]"].length,
      ERC725YDataKeys.LSP4["LSP4Creators[]"].key,
      ERC725YDataKeys.LSP4.LSP4CreatorsMap + deployer.address.substring(2)
    ],
    [
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x" + deployer.address.substring(2).padStart(64, "0"),
      "0x" + "00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
    ]
  );

  console.log("Metadata and creator information set successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 