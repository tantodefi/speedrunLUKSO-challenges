"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, useChainId, useContractWrite, usePublicClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { StyledSelect } from "~~/components/styled/StyledSelect";

const LSP8Loogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();
  const [allLoogies, setAllLoogies] = useState<any[]>([]);
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mintCount, setMintCount] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<bigint | null>(null);
  const perPage = 12n;
  const publicClient = usePublicClient();

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
  const { writeAsync: mintOneAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "mintItem",
  });
  
  // Direct contract write for batch minting
  const { writeAsync: batchMintAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "batchMintItems",
  });

  // Direct contract write for setting username
  const { writeAsync: setUsernameAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "setUPUsername",
  });

  // Calculate estimated price for batch minting
  useEffect(() => {
    if (!price) return;
    
    let totalPrice = 0n;
    let currentPrice = price;
    const curve = 1002n; // 0.2% increase per mint, matches contract
    
    for (let i = 0; i < mintCount; i++) {
      totalPrice += currentPrice;
      currentPrice = (currentPrice * curve) / 1000n;
    }
    
    setEstimatedPrice(totalPrice);
  }, [price, mintCount]);

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
      
      // Refresh price before mint to ensure we have the latest
      await refetchPrice();
      
      if (mintCount === 1) {
        // Single mint
        console.log("Attempting to mint a single LSP8Loogie with direct contract interaction");
        console.log("Current price:", formatEther(price), "LYX");
        
        const tx = await mintOneAsync({
          value: price,
        });
        console.log("LSP8Loogies mint transaction:", tx.hash);
        notification.success("Successfully minted a new LSP8 Loogie!");
      } else {
        // Batch mint
        console.log(`Attempting to batch mint ${mintCount} LSP8Loogies`);
        
        if (!estimatedPrice) {
          notification.error("Estimated price not available");
          return;
        }
        
        console.log("Estimated total price:", formatEther(estimatedPrice), "LYX");
        
        const tx = await batchMintAsync({
          args: [mintCount],
          value: estimatedPrice,
        });
        
        console.log("LSP8Loogies batch mint transaction:", tx.hash);
        notification.success(`Successfully minted ${mintCount} new LSP8 Loogies!`);
      }
      
      // Trigger a refresh of the data and price
      await Promise.all([refetchTotalSupply(), refetchPrice()]);
      console.log("Updated price after mint:", price ? formatEther(price) : "unknown", "LYX");
      setRefreshTrigger(prev => prev + 1);
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
    if (!totalSupply || !deployedContractData?.address || !publicClient) return;
    
    const fetchTokenIds = async () => {
      try {
        // Try using the paginated token ID function first
        let pageTokens: bigint[] = [];
        
        try {
          const offset = (Number(page) - 1) * Number(perPage);
          const pageSize = Number(perPage);
          
          const getPaginatedTokensPromise = publicClient.readContract({
            address: deployedContractData.address as `0x${string}`,
            abi: deployedContractData.abi,
            functionName: 'getTokenIdsPaginated',
            args: [offset, pageSize],
          });
          
          // Add a timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout getting paginated token IDs")), 3000)
          );
          
          // Race the promises
          const result = await Promise.race([getPaginatedTokensPromise, timeoutPromise]);
          pageTokens = result as bigint[];
        } catch (paginationError) {
          console.log("getTokenIdsPaginated function not available, trying getAllTokenIds");
          
          // Use the getAllTokenIds function to get the list of existing token IDs
          try {
            const getAllTokensPromise = publicClient.readContract({
              address: deployedContractData.address as `0x${string}`,
              abi: deployedContractData.abi,
              functionName: 'getAllTokenIds',
            });
            
            // Add a timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("Timeout getting all token IDs")), 3000)
            );
            
            // Race the promises
            const result = await Promise.race([getAllTokensPromise, timeoutPromise]);
            const allTokens = result as bigint[];
            
            // Filter tokens to get the current page
            const tokensArray = Array.isArray(allTokens) ? allTokens : [];
            const startIndex = (Number(page) - 1) * Number(perPage);
            const endIndex = Math.min(startIndex + Number(perPage), tokensArray.length);
            
            // Get tokens for the current page (reverse order to show newest first)
            pageTokens = tokensArray.slice(startIndex, endIndex).reverse();
          } catch (error) {
            console.log("getAllTokenIds function not available yet, falling back to manual check");
            // If the function doesn't exist (contract not redeployed yet), fall back to limited check
            
            // Only check a reasonable number of potential tokens to avoid excessive calls
            const potentialIds: bigint[] = [];
            const totalSupplyNum = Number(totalSupply);
            const maxToCheck = Math.min(totalSupplyNum, 25); // Limit to 25 tokens to check
            
            for (let i = 1; i <= maxToCheck; i++) {
              potentialIds.push(BigInt(i));
            }
            
            // Check which ones exist with batch function if available
            try {
              const batchCheckPromise = publicClient.readContract({
                address: deployedContractData.address as `0x${string}`,
                abi: deployedContractData.abi,
                functionName: 'batchTokenExists',
                args: [potentialIds],
              });
              
              // Add a timeout to prevent hanging
              const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error("Timeout on batch token check")), 3000)
              );
              
              // Race the promises
              const batchResults = await Promise.race([batchCheckPromise, timeoutPromise]) as boolean[];
              
              // Filter to get only existing tokens
              pageTokens = potentialIds.filter((id, index) => batchResults[index]);
            } catch (batchError) {
              console.log("batchTokenExists not available, falling back to individual checks");
              
              // Check which ones exist with batched promises
              const checkPromises = potentialIds.map(async (id) => {
                try {
                  const tokenIdHex = `0x${id.toString().padStart(64, '0')}`;
                  const checkPromise = publicClient.readContract({
                    address: deployedContractData.address as `0x${string}`,
                    abi: deployedContractData.abi,
                    functionName: 'tokenOwnerOf',
                    args: [tokenIdHex],
                  });
                  
                  // Add a timeout to prevent hanging
                  const timeoutPromise = new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout checking token ${id}`)), 1000)
                  );
                  
                  // Race the promises
                  await Promise.race([checkPromise, timeoutPromise]);
                  return id;
                } catch (error) {
                  return null;
                }
              });
              
              // Execute all checks with a timeout
              const checkPromise = Promise.all(checkPromises);
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout on batch token check")), 5000)
              );
              
              try {
                const results = await Promise.race([checkPromise, timeoutPromise]);
                pageTokens = results.filter((id): id is bigint => id !== null);
              } catch (timeoutError) {
                console.log("Batch token check timed out, using limited results");
                // Just use the latest few tokens as a fallback
                const count = Number(totalSupply);
                for (let i = 1; i <= Math.min(count, 5); i++) {
                  pageTokens.push(BigInt(i));
                }
              }
            }
          }
        }
        
        // Convert to bytes32 format for LSP8
        return pageTokens.map(id => `0x${id.toString().padStart(64, '0')}`);
      } catch (error) {
        console.error("Error fetching token IDs:", error);
        
        // Fallback: Generate sequential token IDs based on totalSupply, but limit to a few
        const tokens: string[] = [];
        const totalSupplyNumber = Number(totalSupply);
        const count = Math.min(totalSupplyNumber, 5);
        
        for (let i = 1; i <= count; i++) {
          // Convert to bytes32 format for LSP8
          tokens.push(`0x${i.toString().padStart(64, '0')}`);
        }
        
        return tokens;
      }
    };
    
    // Fetch token data from the contract
    const fetchTokenData = async () => {
      setLoadingLoogies(true);
      setAllLoogies([]);
      
      // Set a timeout to stop loading if it takes too long
      const timeoutId = setTimeout(() => {
        setLoadingLoogies(false);
        console.log("Loading timeout reached, stopping loading state");
      }, 10000); // 10 second timeout
      
      try {
        // First, get the list of tokens to check
        const tokenIds = await fetchTokenIds();
        console.log("Token IDs for current page:", tokenIds);
        
        const newLoogies: {
          id: string;
          owner?: string;
          name?: string;
          description?: string;
          svgContent?: string | null;
          attributes?: any[];
          [key: string]: any;
        }[] = [];
        
        // Process tokens in batches to avoid hanging
        const processTokens = async () => {
          for (const tokenId of tokenIds) {
            try {
              // Check if token exists before fetching details
              let tokenExists = false;
              try {
                // Try the tokenExists function first (new contract version)
                try {
                  const exists = await publicClient.readContract({
                    address: deployedContractData.address as `0x${string}`,
                    abi: deployedContractData.abi,
                    functionName: 'tokenExists',
                    args: [BigInt(tokenId)],
                  });
                  
                  tokenExists = Boolean(exists);
                } catch (functionError) {
                  // If tokenExists function doesn't exist yet, try tokenOwnerOf as fallback
                  try {
                    // Use a timeout for this call
                    const tokenOwnerPromise = publicClient.readContract({
                      address: deployedContractData.address as `0x${string}`,
                      abi: deployedContractData.abi,
                      functionName: 'tokenOwnerOf',
                      args: [tokenId],
                    });
                    
                    // Add a timeout to prevent hanging
                    const timeoutPromise = new Promise((_, reject) => 
                      setTimeout(() => reject(new Error("Timeout checking token owner")), 2000)
                    );
                    
                    // Race the promises
                    await Promise.race([tokenOwnerPromise, timeoutPromise]);
                    tokenExists = true;
                  } catch (ownerError) {
                    // If tokenOwnerOf fails, token doesn't exist
                    tokenExists = false;
                  }
                }
                
                if (!tokenExists) {
                  console.log(`Token ${tokenId} does not exist, skipping...`);
                  continue;
                }
              } catch (error) {
                console.log(`Error checking if token ${tokenId} exists:`, error);
                continue;
              }
              
              // Only fetch token data if it exists
              try {
                console.log(`Fetching token ${tokenId}`);
                const tokenURIPromise = publicClient.readContract({
                  address: deployedContractData.address as `0x${string}`,
                  abi: deployedContractData.abi,
                  functionName: 'tokenURI',
                  args: [tokenId],
                });
                
                // Add a timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error("Timeout fetching tokenURI")), 5000)
                );
                
                // Race the promises
                const tokenURI = await Promise.race([tokenURIPromise, timeoutPromise]);
                
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
                  
                  // Get the token owner
                  const ownerPromise = publicClient.readContract({
                    address: deployedContractData.address as `0x${string}`,
                    abi: deployedContractData.abi,
                    functionName: 'tokenOwnerOf',
                    args: [tokenId],
                  });
                  
                  // Add a timeout to prevent hanging
                  const ownerTimeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout fetching owner")), 2000)
                  );
                  
                  // Race the promises
                  const owner = await Promise.race([ownerPromise, ownerTimeoutPromise]);
                  
                  newLoogies.push({
                    id: tokenId,
                    owner,
                    ...metadata,
                    svgContent
                  });
                  
                  console.log(`Fetched token ${tokenId}:`, metadata);
                }
              } catch (error) {
                console.error(`Error fetching token ${tokenId} data:`, error);
              }
            } catch (error) {
              console.error(`Error processing token ${tokenId}:`, error);
            }
          }
        };
        
        await processTokens();
        setAllLoogies(newLoogies);
      } catch (error) {
        console.error("Error loading tokens:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoadingLoogies(false);
      }
    };
    
    fetchTokenData();
  }, [totalSupply, page, refreshTrigger, deployedContractData, publicClient, perPage]);

  // Update page when user changes it
  const handlePageChange = (newPage: bigint) => {
    setPage(newPage);
  };

  // Function to force refresh the data
  const refreshData = async () => {
    await refetchTotalSupply();
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Auto-refresh when mint is successful
  useEffect(() => {
    // Setup interval to check for new tokens
    const intervalId = setInterval(() => {
      refetchTotalSupply();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchTotalSupply]);
  
  // Listen for changes in totalSupply and refresh the data
  useEffect(() => {
    if (totalSupply !== undefined) {
      // When totalSupply changes, refresh the tokens
      setRefreshTrigger(prev => prev + 1);
    }
  }, [totalSupply]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="relative w-48 h-48 -m-12">
          <Image alt="Loogie" className="cursor-pointer" fill src="/loogie-pink.svg" />
        </div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">LuksoLoogies (LSP8)</span>
            <span className="block text-2xl mt-4 mb-2">LUKSO Standard LSP8 Loogies with a smile :)</span>
          </h1>
          <div className="text-center">
            <div>Only 3728 LuksoLoogies available on a price curve increasing 0.2% with each new mint.</div>
            <div>
              Double the supply of the{" "}
              <a className="underline" href="https://loogies.io/" target="_blank" rel="noopener noreferrer">
                Original LUKSO Mainnet Loogies
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center mt-6 mb-8">
            <div className="card bg-base-100 shadow-md p-4 max-w-md w-full border border-base-300">
              <div className="card-body p-2">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Mint count:</label>
                      <div className="dropdown dropdown-right">
                        <label 
                          tabIndex={0} 
                          className={`w-24 btn btn-sm bg-base-100 border border-base-300 hover:border-primary ${isMinting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="font-normal">{mintCount}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-24 mt-1">
                          {[1, 2, 3, 5, 10].map(count => (
                            <li key={count}>
                              <button
                                type="button"
                                disabled={isMinting}
                                className={`${count === mintCount ? "bg-base-200 font-medium" : ""} ${isMinting ? "cursor-not-allowed" : "hover:bg-base-200"}`}
                                onClick={() => {
                                  if (!isMinting) {
                                    setMintCount(count);
                                    // Find the dropdown element and remove its tabIndex focus
                                    const dropdownElement = document.querySelector('.dropdown label[tabIndex="0"]') as HTMLElement | null;
                                    if (dropdownElement) {
                                      dropdownElement.blur();
                                    }
                                  }
                                }}
                              >
                                {count}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Price: <span className="font-bold">{estimatedPrice ? (+formatEther(estimatedPrice)).toFixed(6) : "-"} LYX</span></span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleMint}
                    className="btn btn-primary w-full"
                    disabled={!connectedAddress || !price || isMinting}
                  >
                    {isMinting ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Minting...
                      </>
                    ) : (
                      <>
                        Mint {mintCount > 1 ? `${mintCount} Loogies` : 'Loogie Now'}
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="badge badge-neutral">{Number(3728n - (totalSupply || 0n))} Loogies left</div>
                    <button onClick={refreshData} className="btn btn-xs btn-ghost">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-4 p-8">
          <div className="flex justify-center items-center space-x-2">
            {loadingLoogies ? (
              <div className="my-8 flex flex-col items-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 font-medium">Loading Loogies...</p>
                <p className="text-sm text-gray-500 mt-2">This might take a moment if you've just minted tokens</p>
                <button 
                  onClick={refreshData} 
                  className="btn btn-sm btn-outline mt-4"
                  disabled={isMinting}
                >
                  Cancel and Refresh
                </button>
              </div>
            ) : !allLoogies?.length ? (
              <div className="my-12 flex flex-col items-center">
                <p className="text-xl font-medium">No loogies found</p>
                <p className="mt-2 mb-4">Either no tokens exist yet or there was an error loading tokens.</p>
                <button 
                  onClick={refreshData} 
                  className="btn btn-primary"
                >
                  Refresh Tokens
                </button>
                {totalSupply && Number(totalSupply) > 0 ? (
                  <p className="mt-4 text-sm">Total supply: {totalSupply.toString()} tokens</p>
                ) : null}
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
                              className="rounded-lg overflow-hidden bg-base-200"
                            />
                          ) : (
                            <div className="rounded-lg overflow-hidden bg-base-200 p-2">
                              <Image src="/loogie.svg" alt={loogie.name} width="300" height="300" />
                            </div>
                          )}
                        </div>
                        <p className="mb-2 text-sm">{loogie.description}</p>
                        <div className="mt-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Owner:</span>
                            <Address address={loogie.owner} />
                          </div>
                        </div>
                        {/* UP Username section - only visible to token owner */}
                        {loogie.owner && connectedAddress && loogie.owner.toLowerCase() === connectedAddress.toLowerCase() && (
                          <div className="mt-4 w-full border-t pt-4">
                            <span className="text-sm font-semibold block mb-2">Set UP Username:</span>
                            <form 
                              className="flex gap-2" 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const input = form.elements.namedItem('username') as HTMLInputElement;
                                const username = input.value;
                                
                                if (!username || username.trim() === '') return;
                                try {
                                  if (!deployedContractData?.address) return;
                                  
                                  // Call the contract to set the username
                                  const writeResult = await setUsernameAsync({
                                    args: [loogie.id, username],
                                  });
                                  
                                  notification.success("Username updated! Refresh to see changes.");
                                  console.log("Updated username:", writeResult);
                                  
                                  // Reset the form
                                  form.reset();
                                  
                                  // Refresh after a short delay
                                  setTimeout(() => {
                                    setRefreshTrigger(prev => prev + 1);
                                  }, 3000);
                                } catch (error) {
                                  console.error("Error setting username:", error);
                                  notification.error("Failed to update username");
                                }
                              }}
                            >
                              <div className="join w-full">
                                <input 
                                  type="text" 
                                  name="username"
                                  placeholder={loogie.attributes?.find((attr: any) => attr.trait_type === 'upUsername')?.value || "luksonaut"}
                                  className="input input-bordered join-item flex-grow" 
                                />
                                <button type="submit" className="btn btn-primary join-item">Update</button>
                              </div>
                            </form>
                          </div>
                        )}
                        {loogie.attributes && (
                          <div className="mt-2 text-sm w-full border-t pt-2">
                            <h3 className="font-medium mb-1 text-left">Attributes:</h3>
                            <div className="grid grid-cols-2 gap-x-1 gap-y-2">
                              {loogie.attributes.map((attr: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-base-200 rounded-lg px-2 py-1">
                                  <span className="font-semibold">{attr.trait_type}:</span>
                                  <span className="ml-1 truncate">{attr.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                    {totalSupply !== undefined && 
                     // Calculate max pages based on totalSupply
                     (() => {
                        const maxPages = Math.ceil(Number(totalSupply) / Number(perPage));
                        return (Number(page) < maxPages) && (
                          <button className="join-item btn" onClick={() => handlePageChange(page + 1n)}>
                            »
                          </button>
                        );
                      })()
                    }
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