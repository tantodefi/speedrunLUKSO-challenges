"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  uri: string;
  owner: string;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourLSP8Collectible",
  });

  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "YourLSP8Collectible",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      // Use allTokenIds() to enumerate all minted NFTs
      const allTokenIds: string[] = await yourCollectibleContract.read.allTokenIds();
      for (const tokenId of allTokenIds) {
        try {
          const owner = await yourCollectibleContract.read.tokenOwnerOf([tokenId]);
          if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
            // Fetch metadata URI from contract (LUKSO way)
            const metadataURI = await yourCollectibleContract.read.getTokenMetadata([tokenId]);
            console.log("[NFT Debug] tokenId:", tokenId, "metadataURI:", metadataURI);
            let nftMetadata = {};
            let validMetadata = false;
            if (
              metadataURI &&
              typeof metadataURI === "string" &&
              metadataURI.startsWith("ipfs://") &&
              metadataURI.length > "ipfs://".length
            ) {
              const ipfsUrl = metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/");
              console.log("[NFT Debug] Fetching metadata from IPFS:", ipfsUrl);
              try {
                const response = await fetch(ipfsUrl);
                nftMetadata = await response.json();
                validMetadata = true;
                console.log("[NFT Debug] Metadata fetched:", nftMetadata);
              } catch (err) {
                console.error("[NFT Debug] Failed to fetch or parse metadata from IPFS for token", tokenId, err);
                // If fetch fails, leave nftMetadata empty
              }
            } else {
              console.warn("[NFT Debug] Invalid or missing metadataURI for token", tokenId, metadataURI);
            }
            collectibleUpdate.push({
              id: tokenId,
              uri: metadataURI,
              owner,
              LSP4Metadata: validMetadata && nftMetadata.LSP4Metadata ? nftMetadata.LSP4Metadata : undefined,
            });
          }
        } catch (e) {
          // Ignore tokens that error
        }
      }
      // Sort by tokenId (as string, since bytes32 hex)
      collectibleUpdate.sort((a, b) => a.id.localeCompare(b.id));
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, myTotalBalance]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">No NFTs found</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myAllCollectibles.map(item => (
            <NFTCard nft={item} key={item.id} />
          ))}
        </div>
      )}
    </>
  );
};
