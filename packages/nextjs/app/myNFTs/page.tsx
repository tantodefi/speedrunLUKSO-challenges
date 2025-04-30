"use client";

import { MyHoldings } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";

import { useState } from "react";

const MyNFTs: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const { writeContractAsync } = useScaffoldWriteContract("YourLSP8Collectible");

  // Track which NFT to mint next (round-robin)
  const [mintIndex, setMintIndex] = useState(0);

  const handleMintItem = async () => {
    console.log("Mint button clicked");
    console.log("writeContractAsync:", writeContractAsync);
    // Generate a unique bytes32 tokenId using timestamp and randomness
    const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
    const tokenIdHex = `0x${BigInt(uniqueId).toString(16).padStart(64, '0')}`;
    console.log("Generated tokenId:", tokenIdHex);
    const currentTokenMetaData = nftsMetadata[mintIndex % nftsMetadata.length];
    const notificationId = notification.loading("Uploading to IPFS");
    try {
      const uploadedItem = await addToIPFS(currentTokenMetaData);
      console.log("[NFT Debug] uploadedItem:", uploadedItem);
      let ipfsUri = "";
      if (uploadedItem && typeof uploadedItem.cid === "string") {
        ipfsUri = `ipfs://${uploadedItem.cid}`;
      } else {
        console.error("[NFT Debug] Invalid IPFS upload result:", uploadedItem);
        notification.remove(notificationId);
        notification.error("Failed to upload metadata to IPFS - invalid response");
        return;
      }
      console.log("[NFT Debug] ipfsUri:", ipfsUri);

      // First remove previous loading notification and then show success notification
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      await writeContractAsync({
        functionName: "mint",
        args: [connectedAddress, tokenIdHex, ipfsUri],
      });
      // Cycle to the next NFT for next mint
      setMintIndex((prev) => prev + 1);
    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My LSP8 NFTs</span>
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <button className="btn btn-secondary" onClick={handleMintItem}>
          Mint NFT
        </button>
        {/* <div className="mt-2 text-xs text-gray-500">
          isConnected: {String(isConnected)}, isConnecting: {String(isConnecting)}, connectedAddress: {connectedAddress}<br />
          <span>Generated tokenId: (see console on mint)</span>
        </div> */}
        {!isConnected && <div className="text-red-500">Wallet not connected</div>}
      </div>
      <MyHoldings />
    </>
  );
};

export default MyNFTs;
