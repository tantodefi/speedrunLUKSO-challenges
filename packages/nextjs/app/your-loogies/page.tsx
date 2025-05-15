"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const YourLoogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [yourLoogies, setYourLoogies] = useState<any[]>();
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const publicClient = usePublicClient();

  const { data: price, error: priceError } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
    onError: (error: Error) => {
      console.log("Error fetching price:", error);
    }
  });

  const { data: totalSupply, error: totalSupplyError } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "totalSupply",
    onError: (error: Error) => {
      console.log("Error fetching totalSupply:", error);
    }
  });

  const { data: balance, error: balanceError } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "balanceOf",
    args: [connectedAddress],
    onError: (error: Error) => {
      console.log("Error fetching balance:", error);
    }
  });

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  const { data: contract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  const { data: lsp8LoogiesContract } = useScaffoldContract({
    contractName: "LSP8LoogiesBasic",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const updateAllLoogies = async () => {
      setLoadingLoogies(true);
      if (contract && balance && connectedAddress && publicClient) {
        const collectibleUpdate = [];
        try {
          for (let tokenIndex = 0n; tokenIndex < balance; tokenIndex++) {
            try {
              const tokenId = await publicClient.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: 'tokenOfOwnerByIndex',
                args: [connectedAddress, tokenIndex],
              });
              
              const tokenURI = await publicClient.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: 'tokenURI',
                args: [tokenId],
              });
              
              const base64Data = (tokenURI as string).substring(29);
              const jsonManifestString = atob(base64Data);

              try {
                const jsonManifest = JSON.parse(jsonManifestString);
                
                const svgContent = jsonManifest.image.startsWith('data:image/svg+xml;base64,') 
                  ? atob(jsonManifest.image.split(',')[1]) 
                  : null;
                  
                collectibleUpdate.push({ 
                  id: tokenId, 
                  uri: tokenURI, 
                  owner: connectedAddress,
                  svgContent,
                  ...jsonManifest 
                });
              } catch (e) {
                console.log("Error parsing JSON manifest:", e);
              }
            } catch (e) {
              console.log("Error fetching token data:", e);
            }
          }
        } catch (e) {
          console.log("Error in token loop:", e);
        }
        console.log("Collectible Update: ", collectibleUpdate);
        setYourLoogies(collectibleUpdate);
      }
      setLoadingLoogies(false);
    };
    updateAllLoogies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, connectedAddress, Boolean(contract), isMounted, publicClient]);

  const handleMint = async () => {
    try {
      // Use fixed default price if price is not available from contract
      const mintPrice = price || 1000000000000000n; // 0.001 ETH as fallback
      
      if (!connectedAddress) {
        notification.error("Please connect your wallet");
        return;
      }
      
      await writeContractAsync({
        functionName: "mintItem",
        value: mintPrice,
      });
      
      notification.success("Successfully minted a new Loogie!");
      
      // Refresh after a short delay
      setTimeout(() => {
        setLoadingLoogies(true);
      }, 3000);
    } catch (e) {
      console.error("Mint error:", e);
      notification.error("Failed to mint Loogie. See console for details.");
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Your Loogies</span>
          </h1>
          <div className="text-center mt-4">
            <div>Loading...</div>
          </div>
        </div>
        <div className="flex-grow bg-base-300 w-full mt-4 p-8">
          <div className="flex justify-center items-center">
            <div className="my-8 flex flex-col items-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="relative w-48 h-48 -m-12">
          <Image alt="Loogie" className="cursor-pointer" fill src="/loogie.svg" />
        </div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Your Loogies</span>
          </h1>
          <div className="flex flex-col justify-center items-center mt-4 space-y-4">
            <button
              onClick={handleMint}
              className="btn btn-primary"
              disabled={!connectedAddress}
            >
              Mint Now for {price ? (+formatEther(price)).toFixed(6) : "0.001"} ETH
            </button>
            <p>{Number(3728n - (totalSupply || 0n))} Loogies left</p>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-4 p-8">
          <div className="flex justify-center items-center">
            {loadingLoogies ? (
              <div className="my-8 flex flex-col items-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 font-medium">Loading Your Loogies...</p>
              </div>
            ) : !yourLoogies?.length ? (
              <div className="my-12 flex flex-col items-center">
                <p className="text-xl font-medium">You don't own any loogies yet</p>
                <p className="mt-2">Mint one to see it here!</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
                  {yourLoogies.map(loogie => {
                    return (
                      <div
                        key={loogie.id}
                        className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl shadow-md hover:shadow-lg transition-all relative"
                      >
                        {lsp8LoogiesContract && (
                          <a 
                            href={`https://universaleverything.io/asset/${lsp8LoogiesContract?.address}/tokenId/${loogie.id}?network=testnet`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 p-1 rounded-full bg-base-200 hover:bg-base-300 transition-colors"
                            title="View on Universal Explorer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        )}
                        <h2 className="text-xl font-bold">{loogie.name}</h2>
                        <div className="my-4">
                          {loogie.svgContent ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: loogie.svgContent }} 
                              style={{ width: '300px', height: '300px' }}
                              className="rounded-lg overflow-hidden bg-base-200"
                            />
                          ) : (
                            <div className="rounded-lg overflow-hidden bg-base-200 p-2">
                              <Image src="/loogie.svg" alt={loogie.name} width="300" height="300" />
                            </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default YourLoogies;
