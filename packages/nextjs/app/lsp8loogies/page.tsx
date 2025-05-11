"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, useChainId, useContractWrite } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const LSP8Loogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();
  const [allLoogies, setAllLoogies] = useState<any[]>([]);
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const perPage = 12n;

  // Get the contract information
  const { data: deployedContractData } = useDeployedContractInfo("LSP8Loogies");

  // Get the price
  const { data: price, refetch: refetchPrice } = useScaffoldReadContract({
    contractName: "LSP8Loogies",
    functionName: "price",
  });

  // Get the total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: "LSP8Loogies",
    functionName: "totalSupply",
  });

  // Direct contract write without using the scaffold helper
  const { writeAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "mintItem",
  });

  // Handle minting
  const { writeContractAsync } = useScaffoldWriteContract("LSP8Loogies");

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
      console.log("Attempting to mint LSP8Loogies with direct contract interaction");
      console.log("Current price:", formatEther(price), "ETH");
      
      // Use direct contract interaction with the current price
      if (writeAsync) {
        // Refresh price before mint to ensure we have the latest
        await refetchPrice();

        const tx = await writeAsync({
          value: price,
        });
        console.log("LSP8Loogies mint transaction:", tx.hash);
        notification.success("Successfully minted a new LSP8 Loogie!");
        
        // Trigger a refresh of the data and price
        await Promise.all([refetchTotalSupply(), refetchPrice()]);
        console.log("Updated price after mint:", price ? formatEther(price) : "unknown");
        setRefreshTrigger(prev => prev + 1);
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

  // Generate array of token IDs for the current page
  useEffect(() => {
    if (!totalSupply) return;
    
    const generateTokenIds = () => {
      const tokens = [];
      const startIndex = Number(totalSupply) - Number(perPage) * (Number(page) - 1);
      const endIndex = Math.max(startIndex - Number(perPage), 0);
      
      for (let i = startIndex; i > endIndex && i > 0; i--) {
        // Convert to bytes32 format for LSP8
        tokens.push(`0x${i.toString().padStart(64, '0')}`);
      }
      
      return tokens;
    };
    
    const tokenIds = generateTokenIds();
    console.log("Generated token IDs:", tokenIds);
    
    // Effect to load tokens when totalSupply or page changes
    const loadTokens = async () => {
      if (!totalSupply) return;
      
      setLoadingLoogies(true);
      setAllLoogies([]);
      
      try {
        console.log("Loading tokens for page", page.toString());
        
        // For demo purposes, we'll just set some placeholder data
        const newLoogies = tokenIds.map((id, index) => {
          const tokenNumber = parseInt(id.slice(2), 16);
          return {
            id,
            name: `Loogie #${tokenNumber}`,
            description: `This is a LUKSO LSP8 Loogie #${tokenNumber}`,
            image: `/loogie.svg`, // Placeholder
            owner: connectedAddress || "0x0000000000000000000000000000000000000000"
          };
        });
        
        setAllLoogies(newLoogies);
      } catch (error) {
        console.error("Error loading tokens:", error);
      } finally {
        setLoadingLoogies(false);
      }
    };
    
    loadTokens();
  }, [totalSupply, page, connectedAddress, refreshTrigger]);

  // Update page when user changes it
  const handlePageChange = (newPage: bigint) => {
    setPage(newPage);
  };

  // Function to force refresh the data
  const refreshData = async () => {
    await refetchTotalSupply();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="relative w-48 h-48 -m-12">
          <Image alt="Loogie" className="cursor-pointer" fill src="/loogie.svg" />
        </div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">OptimisticLoogies (LSP8)</span>
            <span className="block text-2xl mt-4 mb-2">LUKSO Standard LSP8 Loogies with a smile :)</span>
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
            <div className="flex gap-2 mt-3">
              <p>{Number(3728n - (totalSupply || 0n))} Loogies left</p>
              <button onClick={refreshData} className="btn btn-xs btn-outline">
                Refresh
              </button>
            </div>
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
                          <Image src={loogie.image} alt={loogie.name} width="300" height="300" />
                        </div>
                        <p className="mb-2">{loogie.description}</p>
                        <div className="mt-2">
                          <span className="text-sm font-semibold">Owner:</span>
                          <Address address={loogie.owner} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-8">
                  <div className="join">
                    {page > 1n && (
                      <button className="join-item btn" onClick={() => handlePageChange(page - 1n)}>
                        «
                      </button>
                    )}
                    <button className="join-item btn btn-disabled">Page {page.toString()}</button>
                    {totalSupply !== undefined && totalSupply > page * perPage && (
                      <button className="join-item btn" onClick={() => handlePageChange(page + 1n)}>
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

export default LSP8Loogies; 