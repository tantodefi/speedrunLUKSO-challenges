"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, useChainId, useContractWrite } from "wagmi";
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
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const perPage = 12n;

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

  useEffect(() => {
    const updateAllLoogies = async () => {
      setLoadingLoogies(true);
      
      if (deployedContractData?.address && totalSupply) {
        try {
          // For now, create placeholder data instead of fetching actual token data
          const collectibleUpdate = [];
          const count = Number(totalSupply);
          const pageStart = count - Number(perPage) * (Number(page) - 1);
          const pageEnd = Math.max(pageStart - Number(perPage), 0);
          
          for (let i = pageStart; i > pageEnd; i--) {
            const tokenId = BigInt(i);
            collectibleUpdate.push({ 
              id: tokenId,
              name: `Loogie #${tokenId.toString()}`,
              image: "/loogie.svg",
              description: `This is an Optimistic Loogie #${tokenId.toString()}`,
              owner: connectedAddress || "0x0000000000000000000000000000000000000000"
            });
          }

          setAllLoogies(collectibleUpdate);
        } catch (e) {
          console.error("Error generating loogies:", e);
        }
      }
      
      setLoadingLoogies(false);
    };
    
    updateAllLoogies();
  }, [totalSupply, page, perPage, deployedContractData?.address, connectedAddress]);

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
              <p className="my-2 font-medium">Loading...</p>
            ) : !allLoogies?.length ? (
              <p className="my-2 font-medium">No loogies minted</p>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
                  {allLoogies.map(loogie => {
                    return (
                      <div
                        key={loogie.id}
                        className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl"
                      >
                        <h2 className="text-xl font-bold">{loogie.name}</h2>
                        <Image src={loogie.image} alt={loogie.name} width="300" height="300" />
                        <p>{loogie.description}</p>
                        <Address address={loogie.owner} />
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
