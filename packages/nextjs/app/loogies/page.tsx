"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, useChainId, useContractWrite, useContractRead, usePublicClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Loogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();
  const [allLoogies, setAllLoogies] = useState<any[]>([]);
  const [tokenIdsToFetch, setTokenIdsToFetch] = useState<bigint[]>([]);
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const perPage = 12n;
  const publicClient = usePublicClient();

  // Get the contract information
  const { data: deployedContractData } = useDeployedContractInfo("YourCollectible");

  // Get the price
  const { data: price, refetch: refetchPrice } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
  });

  // Get the total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "totalSupply",
  });

  // Direct contract write without using the scaffold helper
  const { writeAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "mintItem",
  });

  // Handle minting
  const handleMint = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!deployedContractData?.address) {
      notification.error("Contract data not available");
      return;
    }

    const isLocalBurnerWallet = !chainId && !!connectedAddress && targetNetwork.id === 31337;

    if (chainId && chainId !== targetNetwork.id && !isLocalBurnerWallet) {
      notification.error("You are on the wrong network");
      return;
    }

    if (!price) {
      notification.error("Price not available");
      return;
    }

    try {
      setIsMinting(true);
      console.log("Attempting to mint YourCollectible with direct contract interaction");
      console.log("Current price:", formatEther(price), "ETH");
      
      // Use direct contract interaction with the current price
      if (writeAsync) {
        // Get the latest price again just to be sure
        await refetchPrice();
        
        const tx = await writeAsync({
          value: price,
        });
        console.log("YourCollectible mint transaction:", tx.hash);
        notification.success("Successfully minted a new Loogie!");
        
        // Trigger a refresh of the data and price
        await Promise.all([refetchTotalSupply(), refetchPrice()]);
        console.log("Updated price after mint:", price ? formatEther(price) : "unknown");
      } else {
        notification.error("Contract interaction not available");
      }
    } catch (e: any) {
      console.error("Minting error:", e);
      
      // Check if the error is "NOT ENOUGH" and provide a helpful message
      const errorMessage = e.toString();
      if (errorMessage.includes("NOT ENOUGH")) {
        notification.error("Price has increased. Please try again with the updated price.");
        await refetchPrice();
      } else {
        notification.error("Failed to mint Loogie. See console for details.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Generate token IDs based on page and totalSupply
  useEffect(() => {
    if (totalSupply) {
      const ids: bigint[] = [];
      const count = Number(totalSupply);
      const pageStart = count - Number(perPage) * (Number(page) - 1);
      const pageEnd = Math.max(pageStart - Number(perPage), 0);
      
      for (let i = pageStart; i > pageEnd; i--) {
        ids.push(BigInt(i));
      }
      
      setTokenIdsToFetch(ids);
    }
  }, [totalSupply, page, perPage]);

  // Fetch token data one by one using wagmi
  useEffect(() => {
    const fetchTokenMetadata = async () => {
      if (!tokenIdsToFetch.length || !deployedContractData?.address || !publicClient) return;
      
      setLoadingLoogies(true);
      const fetchedLoogies = [];
      
      try {
        for (const tokenId of tokenIdsToFetch) {
          try {
            // Use publicClient to call the contract
            const tokenURI = await publicClient.readContract({
              address: deployedContractData.address as `0x${string}`,
              abi: deployedContractData.abi,
              functionName: 'tokenURI',
              args: [tokenId],
            });
            
            if (tokenURI) {
              // Parse base64 encoded data
              // Format: data:application/json;base64,<base64_data>
              const base64Data = (tokenURI as string).split(",")[1];
              const jsonString = atob(base64Data);
              const metadata = JSON.parse(jsonString);
              
              // Parse the SVG from base64
              const svgContent = metadata.image.startsWith('data:image/svg+xml;base64,') 
                ? atob(metadata.image.split(',')[1]) 
                : null;
              
              fetchedLoogies.push({
                id: tokenId,
                ...metadata,
                svgContent
              });
              
              console.log(`Fetched token ${tokenId}:`, metadata);
            }
          } catch (error) {
            console.error(`Error fetching token ${tokenId}:`, error);
            // Add a placeholder for errored tokens
            fetchedLoogies.push({
              id: tokenId,
              name: `Loogie #${tokenId.toString()}`,
              description: "Error fetching this Loogie's data",
              placeholder: true
            });
          }
        }
        
        setAllLoogies(fetchedLoogies);
      } catch (error) {
        console.error("Error fetching token metadata:", error);
      } finally {
        setLoadingLoogies(false);
      }
    };
    
    fetchTokenMetadata();
  }, [tokenIdsToFetch, deployedContractData, publicClient]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="relative w-48 h-48 -m-12">
          <Image alt="Loogie" className="cursor-pointer" fill src="/loogie.svg" />
        </div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">OptimisticLoogies</span>
            <span className="block text-2xl mt-4 mb-2">Loogies with a smile :)</span>
          </h1>
          <div className="text-center">
            <div>Only 3728 Optimistic Loogies available on a price curve increasing 0.2% with each new mint.</div>
            <div>
              Double the supply of the{" "}
              <a className="underline" href="https://loogies.io/" target="_blank" rel="noopener noreferrer">
                Original Ethereum Mainnet Loogies
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center mt-6 space-x-2">
            <button
              onClick={handleMint}
              className="btn btn-primary"
              disabled={!connectedAddress || !price || isMinting}
            >
              {isMinting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Minting...
                </>
              ) : (
                <>Mint Now for {price ? (+formatEther(price)).toFixed(6) : "-"} ETH</>
              )}
            </button>
            <p>{Number(3728n - (totalSupply || 0n))} Loogies left</p>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-4 p-8">
          <div className="flex justify-center items-center space-x-2">
            {loadingLoogies ? (
              <div className="my-8 flex flex-col items-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 font-medium">Loading Loogies...</p>
              </div>
            ) : !allLoogies?.length ? (
              <div className="my-12 flex flex-col items-center">
                <p className="text-xl font-medium">No loogies minted yet</p>
                <p className="mt-2">Be the first to mint a Loogie!</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
                  {allLoogies.map(loogie => {
                    return (
                      <div
                        key={loogie.id}
                        className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl shadow-md hover:shadow-lg transition-all"
                      >
                        <h2 className="text-xl font-bold">{loogie.name}</h2>
                        <div className="my-4">
                          {loogie.svgContent ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: loogie.svgContent }} 
                              style={{ width: '300px', height: '300px' }}
                            />
                          ) : (
                            <Image src="/loogie.svg" alt={loogie.name} width="300" height="300" />
                          )}
                        </div>
                        <p className="mb-2">{loogie.description}</p>
                        <div className="mt-2">
                          <span className="text-sm font-semibold">Owner:</span>
                          <Address address={loogie.owner} />
                        </div>
                        {loogie.attributes && (
                          <div className="mt-2 text-sm">
                            {loogie.attributes.map((attr: any, idx: number) => (
                              <div key={idx} className="flex justify-between gap-2">
                                <span className="font-semibold">{attr.trait_type}:</span>
                                <span>{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-8">
                  <div className="join">
                    {page > 1n && (
                      <button className="join-item btn" onClick={() => setPage(page - 1n)}>
                        «
                      </button>
                    )}
                    <button className="join-item btn btn-disabled">Page {page.toString()}</button>
                    {totalSupply !== undefined && totalSupply > page * perPage && (
                      <button className="join-item btn" onClick={() => setPage(page + 1n)}>
                        »
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Loogies;
