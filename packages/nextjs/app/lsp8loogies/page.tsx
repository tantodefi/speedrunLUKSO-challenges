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

// Helper function to clean color strings
const cleanColorString = (colorStr: string): string => {
  // Make sure it starts with #
  if (!colorStr.startsWith('#')) {
    colorStr = `#${colorStr}`;
  }
  
  // Remove extra bytes (keep only the first 7 characters for #RRGGBB format)
  colorStr = colorStr.substring(0, 7);
  
  // Validate if it's a proper hex color
  if (!/^#[0-9A-Fa-f]{6}$/.test(colorStr)) {
    return "#00ff00"; // Return default color if invalid
  }
  
  return colorStr;
};

// Contract options
type ContractOption = "LSP8Loogies" | "LSP8LoogiesBasic";
const CONTRACT_OPTIONS: { label: string; value: ContractOption }[] = [
  { label: "LuksoLoogies", value: "LSP8Loogies" },
  { label: "Loogies Basic", value: "LSP8LoogiesBasic" }
];

const LSP8Loogies: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();
  const [allLoogies, setAllLoogies] = useState<any[]>([]);
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mintCount, setMintCount] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<bigint | null>(null);
  // Add state for selected contract
  const [selectedContract, setSelectedContract] = useState<ContractOption>("LSP8Loogies");
  // Add state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);
  const perPage = 12n;
  const publicClient = usePublicClient();

  // Set mounted state on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug wallet connection state on mount
  useEffect(() => {
    console.log("Wallet connection state:", { isConnected, connectedAddress, chainId });
  }, [isConnected, connectedAddress, chainId]);

  // Get the contract information based on selection
  const { data: deployedContractData } = useDeployedContractInfo(selectedContract);

  // Get contract version details
  const getContractDetails = () => {
    if (selectedContract === "LSP8LoogiesBasic") {
      return {
        name: "Loogies Basic",
        address: "0x1a591150667ca86de0f8d48ada752115c2587826",
        shortAddress: "0x1a59...7826",
        description: "Basic LSP8 implementation"
      };
    } else {
      return {
        name: "LuksoLoogies",
        address: "0xe1D75B438a4272DEFCa481B660F3781f171d3127",
        shortAddress: "0xe1D7...3127",
        description: "Enhanced LSP8 implementation"
      };
    }
  };

  const contractDetails = getContractDetails();

  // Get the price
  const { data: price, refetch: refetchPrice, error: priceError } = useScaffoldReadContract({
    contractName: selectedContract,
    functionName: "price",
    onError: (error: Error) => {
      console.log(`Error fetching price:`, error);
    },
    // Don't try to read price for LSP8LoogiesBasic as it doesn't expose this function externally
    enabled: selectedContract !== "LSP8LoogiesBasic"
  });

  // Get the total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: selectedContract,
    functionName: "totalSupply",
    onError: (error: Error) => {
      console.log("Error fetching totalSupply:", error);
    }
  });

  // Contract write function for minting
  const { writeAsync: mintOneAsync } = useScaffoldWriteContract(
    selectedContract,
    "mintItem"
  );
  
  const { writeAsync: batchMintAsync } = useScaffoldWriteContract(
    selectedContract,
    "mintLoogies"
  );

  // Direct contract write for setting username
  // Only available in original LSP8Loogies, not in Basic version
  const { writeAsync: setUsernameAsync } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "setUPUsername",
    enabled: selectedContract === "LSP8Loogies",
  });

  // Reset data when contract changes
  useEffect(() => {
    if (!isMounted) return;
    
    setAllLoogies([]);
    setPage(1n);
    setLoadingLoogies(true);
    setRefreshTrigger(prev => prev + 1);
  }, [selectedContract, isMounted]);

  // Calculate estimated price for batch minting
  useEffect(() => {
    if (!isMounted) return;
    
    // If price is not available, use a default value for display
    const defaultPrice = 1000000000000000n; // 0.001 ETH
    
    // For LSP8LoogiesBasic use a fixed price since there's no price function
    const basicPrice = 2000000000000000n; // 0.002 ETH - fixed price for Basic version
    
    // Use appropriate price based on contract
    const currentPrice = selectedContract === "LSP8LoogiesBasic" 
      ? basicPrice 
      : (price || defaultPrice);
    
    let totalPrice = 0n;
    let runningPrice = currentPrice;
    const curve = 1002n; // 0.2% increase per mint, matches contract
    
    for (let i = 0; i < mintCount; i++) {
      totalPrice += runningPrice;
      runningPrice = (runningPrice * curve) / 1000n;
    }
    
    setEstimatedPrice(totalPrice);
  }, [price, mintCount, isMounted, selectedContract]);

  // Multi-token mint handler for contract
  const handleMint = async () => {
    // Don't proceed if already minting or not connected
    if (isMinting || !isConnected) {
      return;
    }
    
    // Safety checks
    if (!deployedContractData || !deployedContractData.address) {
      notification.error("Contract data not available");
      return;
    }

    // Use fixed default price if price is not available from contract
    // Since LSP8LoogiesBasic doesn't properly expose price, always use default for it
    const defaultPrice = 1000000000000000n; // 0.001 ETH
    const basicPrice = 2000000000000000n; // 0.002 ETH - fixed price for Basic version
    const mintPrice = selectedContract === "LSP8LoogiesBasic" ? basicPrice : (price || defaultPrice);

    try {
      setIsMinting(true);
      
      // Try to refresh price before mint (only for original LSP8Loogies)
      if (selectedContract !== "LSP8LoogiesBasic") {
        try {
          await refetchPrice();
        } catch (e) {
          console.log("Could not refresh price, using cached or default price");
        }
      }

      // Calculate total price based on bonding curve
      let totalPrice = 0n;
      let runningPrice = mintPrice;
      let curve = 1002n; // 0.2% increase per mint
      
      for (let i = 0; i < mintCount; i++) {
        totalPrice += runningPrice;
        
        // Increase the price for the bonding curve
        runningPrice = (runningPrice * curve) / 1000n;
      }
      
      if (selectedContract === "LSP8LoogiesBasic") {
        console.log("Attempting to mint a single LSP8LoogiesBasic with direct contract interaction");
        console.log("Current price:", formatEther(totalPrice), "LYX");
      
        try {
          const { hash } = await mintOneAsync({
            value: totalPrice,
          });
        
          notification.success("Minting transaction sent");
        
          // Force refresh after a delay to allow transaction to complete
          setTimeout(() => {
            refreshData();
          }, 3000);
        } catch (e) {
          console.log("Minting error:", e);
          notification.error("Minting failed");
        }
      }
      else {
        // Use scaffoldWriteContract for consistent UX across app
        await batchMintAsync({
          args: [BigInt(mintCount)],
          value: totalPrice,
        });
        
        // Force refresh after mint
        setTimeout(() => {
          refreshData();
        }, 1500);
      }
    } catch (e) {
      console.log("Minting error:", e);
      notification.error("Minting failed");
    } finally {
      setIsMinting(false);
    }
  };

  // Generate array of token IDs for the current page
  useEffect(() => {
    // Skip if no wallet is connected or if contract data is missing
    if (!isConnected || !totalSupply || !deployedContractData?.address || !publicClient || !isMounted) return;
    
    const fetchTokenIds = async () => {
      try {
        // For LSP8LoogiesBasic we'll just manually create a list of token IDs based on totalSupply
        if (selectedContract === "LSP8LoogiesBasic") {
          console.log("LSP8LoogiesBasic doesn't have paginated token functions, creating manual list");
          const totalSupplyNum = Number(totalSupply);
          const pageTokens: bigint[] = [];
          const startId = Math.max(1, (Number(page) - 1) * Number(perPage) + 1);
          const endId = Math.min(startId + Number(perPage) - 1, totalSupplyNum);
          
          for (let i = startId; i <= endId; i++) {
            pageTokens.push(BigInt(i));
          }
          
          // Convert to bytes32 format for LSP8
          return pageTokens.map(id => `0x${id.toString().padStart(64, '0')}`);
        }
        
        // For original LSP8Loogies, try using the paginated token ID function
        let pageTokens: bigint[] = [];
        
        try {
          const offset = (Number(page) - 1) * Number(perPage);
          const pageSize = Number(perPage);
          
          const getPaginatedTokensPromise = publicClient.readContract({
            address: deployedContractData.address as `0x${string}`,
            abi: deployedContractData.abi,
            functionName: 'getTokenIdsPaginated',
            args: [offset, pageSize],
          }).catch(e => {
            console.log("getTokenIdsPaginated function call failed:", e);
            throw e;
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
            }).catch(e => {
              console.log("getAllTokenIds function call failed:", e);
              throw e;
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
              }).catch(e => {
                console.log("batchTokenExists function call failed:", e);
                throw e;
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
                  }).catch(e => {
                    // Silently fail individual token checks
                    return null;
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
                // Different approaches based on contract type
                if (selectedContract === "LSP8LoogiesBasic") {
                  // For LSP8LoogiesBasic, directly try to get the owner
                  // This will throw if the token doesn't exist
                  try {
                    const tokenOwner = await publicClient.readContract({
                      address: deployedContractData.address as `0x${string}`,
                      abi: deployedContractData.abi,
                      functionName: 'tokenOwnerOf',
                      args: [tokenId],
                    });
                    
                    // If we get here, the token exists
                    tokenExists = Boolean(tokenOwner);
                  } catch (err: any) {
                    if (err.toString().includes("TokenDoesNotExist")) {
                      console.log(`Token ${tokenId} does not exist in LSP8LoogiesBasic contract`);
                      tokenExists = false;
                    } else {
                      // Re-throw other errors
                      throw err;
                    }
                  }
                } else {
                  // For regular LSP8Loogies, try the tokenExists function first
                  try {
                    const exists = await publicClient.readContract({
                      address: deployedContractData.address as `0x${string}`,
                      abi: deployedContractData.abi,
                      functionName: 'tokenExists',
                      args: [BigInt(tokenId)],
                    }).catch(() => false);
                    
                    tokenExists = Boolean(exists);
                  } catch (functionError) {
                    // If tokenExists function doesn't exist, try tokenOwnerOf as fallback
                    try {
                      // Use a timeout for this call
                      const tokenOwnerPromise = publicClient.readContract({
                        address: deployedContractData.address as `0x${string}`,
                        abi: deployedContractData.abi,
                        functionName: 'tokenOwnerOf',
                        args: [tokenId],
                      }).catch(() => null);
                      
                      // Add a timeout to prevent hanging
                      const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout checking token owner")), 2000)
                      );
                      
                      // Race the promises
                      const owner = await Promise.race([tokenOwnerPromise, timeoutPromise]);
                      tokenExists = owner !== null;
                    } catch (ownerError) {
                      // If tokenOwnerOf fails, token doesn't exist
                      tokenExists = false;
                    }
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
                
                // For LSP8LoogiesBasic, use a simplified approach for metadata
                let tokenData = null;
                if (selectedContract === "LSP8LoogiesBasic") {
                  try {
                    // For LSP8LoogiesBasic, we'll use stored color values (already available)
                    // and default values for other attributes that don't exist in the ABI
                    
                    // First try to get color which is available in the contract
                    const colorPromise = publicClient.readContract({
                      address: deployedContractData.address as `0x${string}`,
                      abi: deployedContractData.abi,
                      functionName: 'color',
                      args: [tokenId]
                    }).catch(e => {
                      console.warn(`color function error for token ${tokenId}:`, e);
                      return null;
                    });
                    
                    // Add a timeout to prevent hanging
                    const timeoutPromise = new Promise((_, reject) => 
                      setTimeout(() => reject(new Error("Timeout fetching token data")), 3000)
                    );
                    
                    // Get color data with timeout
                    const colorValue = await Promise.race([colorPromise, timeoutPromise])
                      .catch(() => null);
                    
                    // Parse the tokenId to get a number for the name
                    const tokenIdNum = parseInt(tokenId.slice(-8), 16) || parseInt(tokenId) || 0;
                    
                    // Clean up color format
                    let colorStr = "#00ff00"; // Default green fallback
                    if (colorValue) {
                      if (typeof colorValue === 'string') {
                        colorStr = colorValue.startsWith('#') ? colorValue : `#${colorValue}`;
                      } else {
                        colorStr = `#${colorValue.toString(16).padStart(6, '0')}`;
                      }
                      // Trim extra bytes in color (usually appended zeros in some LUKSO contracts)
                      colorStr = colorStr.substring(0, 7);
                    }
                    
                    // Create simplified metadata with default values for missing fields
                    // This matches what Universal Everything does for basic loodies
                    const metadata = {
                      name: `Loogie #${tokenIdNum}`,
                      description: "Loogie NFT on LUKSO",
                      color: colorStr,
                      chubbiness: 50, // Use fixed default values since chubbiness function isn't in ABI
                      mouthLength: 200 // Use fixed default values since mouthLength function isn't in ABI
                    };
                    
                    tokenData = JSON.stringify(metadata);
                  } catch (e) {
                    console.log(`Error fetching metadata for token ${tokenId}:`, e);
                    
                    // Last resort fallback metadata
                    const tokenIdNum = parseInt(tokenId.slice(-8), 16) || parseInt(tokenId) || 0;
                    tokenData = JSON.stringify({
                      name: `Loogie #${tokenIdNum}`,
                      description: "Loogie NFT on LUKSO",
                      color: "#00ff00",
                      chubbiness: 50,
                      mouthLength: 200
                    });
                  }
                } else {
                  // For original LSP8Loogies, use tokenURI
                  const tokenURIPromise = publicClient.readContract({
                    address: deployedContractData.address as `0x${string}`,
                    abi: deployedContractData.abi,
                    functionName: 'tokenURI',
                    args: [tokenId],
                  }).catch(e => {
                    console.warn(`tokenURI function not available for ${tokenId}:`, e);
                    return null; 
                  });
                  
                  // Add a timeout to prevent hanging
                  const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout fetching tokenURI")), 5000)
                  );
                  
                  // Race the promises
                  tokenData = await Promise.race([tokenURIPromise, timeoutPromise]);
                }
                
                // Get the token owner
                const ownerPromise = publicClient.readContract({
                  address: deployedContractData.address as `0x${string}`,
                  abi: deployedContractData.abi,
                  functionName: 'tokenOwnerOf',
                  args: [tokenId],
                }).catch(e => {
                  console.warn(`tokenOwnerOf function not available for ${tokenId}:`, e);
                  return null;
                });
                
                // Add a timeout to prevent hanging
                const ownerTimeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error("Timeout fetching owner")), 2000)
                );
                
                // Race the promises
                const owner = await Promise.race([ownerPromise, ownerTimeoutPromise]);
                
                // Only process metadata if tokenData is available
                if (tokenData) {
                  try {
                    // Parse data based on contract type
                    let metadata;
                    if (selectedContract === "LSP8LoogiesBasic") {
                      // For LSP8LoogiesBasic, the metadata is directly returned as JSON string
                      metadata = JSON.parse(tokenData as string);
                      
                      // Add formatted attributes for LSP8LoogiesBasic to match LSP8Loogies format
                      if (selectedContract === "LSP8LoogiesBasic" && !metadata.attributes) {
                        // Create attributes array from the metadata properties for consistent display
                        metadata.attributes = [
                          { trait_type: "color", value: metadata.color || "#00ff00" },
                          { trait_type: "chubbiness", value: metadata.chubbiness || 50 },
                          { trait_type: "mouthLength", value: metadata.mouthLength || 200 }
                        ];

                        // If we don't have a description, add a standard one
                        if (!metadata.description || metadata.description === "Loogie NFT on LUKSO") {
                          metadata.description = "A cute Loogie NFT on LUKSO blockchain with a unique color and smile!";
                        }
                      }
                    } else {
                      // For LSP8Loogies, the metadata is base64 encoded
                      const tokenBase64Data = (tokenData as string).split(",")[1];
                      const jsonString = atob(tokenBase64Data);
                      metadata = JSON.parse(jsonString);
                    }
                    
                    // Extract SVG from the metadata
                    let svgContent = null;
                    
                    if (selectedContract === "LSP8LoogiesBasic") {
                      try {
                        // Try with getSVG (most direct way)
                        const svgPromise = publicClient.readContract({
                          address: deployedContractData.address as `0x${string}`,
                          abi: deployedContractData.abi,
                          functionName: 'getSVG',
                          args: [tokenId],
                        }).catch(e => {
                          console.log("getSVG not available, trying renderTokenById");
                          return null;
                        });
                        
                        // Add a timeout to avoid hanging
                        const timeoutPromise = new Promise((_, reject) => 
                          setTimeout(() => reject(new Error("Timeout fetching SVG")), 3000)
                        );
                        
                        // Try getSVG first
                        let svgResult = await Promise.race([svgPromise, timeoutPromise])
                          .catch(() => null);
                          
                        if (svgResult) {
                          svgContent = svgResult as string;
                        } else {
                          // If getSVG failed, try renderTokenById
                          const renderPromise = publicClient.readContract({
                            address: deployedContractData.address as `0x${string}`,
                            abi: deployedContractData.abi,
                            functionName: 'renderTokenById',
                            args: [tokenId],
                          }).catch(e => {
                            console.log("renderTokenById not available, reading token attributes");
                            return null;
                          });
                          
                          const renderResult = await Promise.race([renderPromise, timeoutPromise])
                            .catch(() => null);
                            
                          if (renderResult) {
                            // Wrap the render content in an SVG element
                            svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">${renderResult}</svg>`;
                          } else {
                            // If both methods failed, try to rebuild SVG from individual attributes
                            
                            // Get color attribute
                            const colorPromise = publicClient.readContract({
                              address: deployedContractData.address as `0x${string}`,
                              abi: deployedContractData.abi,
                              functionName: 'color',
                              args: [tokenId],
                            }).catch(() => null);
                            
                            // Get chubbiness attribute
                            const chubbinessPromise = publicClient.readContract({
                              address: deployedContractData.address as `0x${string}`,
                              abi: deployedContractData.abi,
                              functionName: 'chubbiness',
                              args: [tokenId],
                            }).catch(() => null);
                            
                            // Get mouthLength attribute
                            const mouthLengthPromise = publicClient.readContract({
                              address: deployedContractData.address as `0x${string}`,
                              abi: deployedContractData.abi,
                              functionName: 'mouthLength',
                              args: [tokenId],
                            }).catch(() => null);
                            
                            // Get all attributes in parallel
                            const [colorValue, chubbinessValue, mouthLengthValue] = await Promise.all([
                              colorPromise, chubbinessPromise, mouthLengthPromise
                            ]);
                            
                            // If we have at least some attributes, build the SVG ourselves
                            if (colorValue || chubbinessValue || mouthLengthValue) {
                              // Convert the color bytes to a hex string
                              let colorHex = "#97138c"; // Default purple
                              if (colorValue) {
                                if (typeof colorValue === 'string') {
                                  colorHex = colorValue.startsWith('#') ? colorValue : `#${colorValue}`;
                                } else {
                                  // Convert numeric representation to hex
                                  colorHex = `#${colorValue.toString(16).padStart(6, '0')}`;
                                }
                                // Ensure it's only 7 chars (#RRGGBB)
                                colorHex = colorHex.substring(0, 7);
                              }
                              
                              // Get chubbiness with default
                              const chubbiness = chubbinessValue ? Number(chubbinessValue) : 50;
                              
                              // Get mouth length with default
                              const mouthLength = mouthLengthValue ? Number(mouthLengthValue) : 200;
                              
                              // Calculate mouth translation based on contract formula: y = 810/11 - 9x/11
                              const translateX = Math.floor((810 - 9 * chubbiness) / 11);
                              
                              // Reconstruct the SVG manually following the contract's pattern
                              svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <g id="eye1">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
  </g>
  <g id="head">
    <ellipse fill="${colorHex}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${chubbiness}" ry="51.80065" stroke="#000"/>
  </g>
  <g id="eye2">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
  </g>
  <g class="mouth" transform="translate(${translateX},0)">
    <path d="M 130 240 Q 165 250 ${mouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
  </g>
</svg>`;
                            }
                          }
                        }
                      } catch (svgError) {
                        console.log("Error fetching SVG:", svgError);
                      }
                    } else {
                      // For original LSP8Loogies, extract SVG from image data
                      if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
                        try {
                          svgContent = atob(metadata.image.split(',')[1]);
                        } catch (decodeError) {
                          console.log("Error decoding SVG base64:", decodeError);
                        }
                      }
                    }
                    
                    // If we still don't have an SVG, use the nice placeholder
                    if (!svgContent) {
                      // Use the nice loogie placeholder
                      const tokenNumber = parseInt(tokenId.slice(-8), 16) || parseInt(tokenId) || 0;
                      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="180" fill="#f0f0f0" stroke="#333" stroke-width="3"/>
  <circle cx="140" cy="150" r="30" fill="white" stroke="#333" stroke-width="3"/>
  <circle cx="260" cy="150" r="30" fill="white" stroke="#333" stroke-width="3"/>
  <circle cx="140" cy="150" r="10" fill="#333"/>
  <circle cx="260" cy="150" r="10" fill="#333"/>
  <path d="M 130 250 Q 200 280 270 250" stroke="#333" stroke-width="5" fill="transparent"/>
  <text x="200" y="330" font-family="Arial" font-size="20" text-anchor="middle" fill="#333">Loogie #${tokenNumber}</text>
</svg>`;
                    }
                    
                    newLoogies.push({
                      id: tokenId,
                      owner,
                      ...metadata,
                      svgContent
                    });
                    
                    console.log(`Fetched token ${tokenId}:`, metadata);
                  } catch (parseError) {
                    // Handle case where metadata doesn't contain valid JSON
                    console.error(`Error parsing token ${tokenId} metadata:`, parseError);
                    newLoogies.push({
                      id: tokenId,
                      owner,
                      name: `Token #${parseInt(tokenId, 16)}`,
                      description: "Metadata unavailable",
                    });
                  }
                } else {
                  // If metadata is not available, add a basic entry
                  newLoogies.push({
                    id: tokenId,
                    owner,
                    name: `Token #${parseInt(tokenId, 16)}`,
                    description: "Metadata unavailable",
                  });
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
  }, [totalSupply, page, refreshTrigger, deployedContractData, publicClient, perPage, isConnected, isMounted]);

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
    // Skip if no wallet is connected or not mounted
    if (!isConnected || !isMounted) return;
    
    // Setup interval to check for new tokens
    const intervalId = setInterval(() => {
      refetchTotalSupply();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchTotalSupply, isConnected, isMounted]);
  
  // Listen for changes in totalSupply and refresh the data
  useEffect(() => {
    // Skip if no wallet is connected or not mounted
    if (!isConnected || !isMounted) return;
    
    if (totalSupply !== undefined) {
      // When totalSupply changes, refresh the tokens
      setRefreshTrigger(prev => prev + 1);
    }
  }, [totalSupply, isConnected, isMounted]);

  // If not mounted yet (server side), render a minimal placeholder
  if (!isMounted) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">LuksoLoogies</span>
            <span className="block text-2xl mt-4 mb-2">LUKSO Standard LSP8 Loogies with a smile :)</span>
          </h1>
          <div className="text-center">
            <div>Loading...</div>
          </div>
        </div>
        {/* Add empty container with same structure to avoid hydration mismatch */}
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
          <Image alt="Loogie" className="cursor-pointer" fill src="/loogie-pink.svg" />
        </div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">LuksoLoogies</span>
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
          
          {/* Contract Selection Toggle */}
          <div className="flex justify-center my-4">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Select Contract Version</span>
              </label>
              <div className="dropdown w-full">
                <label 
                  tabIndex={0} 
                  className={`w-full btn bg-base-100 border border-base-300 hover:border-primary ${isMinting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="font-normal">{
                    CONTRACT_OPTIONS.find(option => option.value === selectedContract)?.label || "Select Contract"
                  }</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-full mt-1">
                  {CONTRACT_OPTIONS.map(option => (
                    <li key={option.value}>
                      <button
                        type="button"
                        disabled={isMinting}
                        className={`${option.value === selectedContract ? "bg-base-200 font-medium" : ""} ${isMinting ? "cursor-not-allowed" : "hover:bg-base-200"}`}
                        onClick={() => {
                          if (!isMinting) {
                            setSelectedContract(option.value);
                            // Find the dropdown element and remove its tabIndex focus
                            const dropdownElement = document.querySelector('.dropdown label[tabIndex="0"]') as HTMLElement | null;
                            if (dropdownElement) {
                              dropdownElement.blur();
                            }
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  {contractDetails.description} ({contractDetails.shortAddress})
                </span>
              </label>
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
                      <span className="text-sm font-medium">Price: <span className="font-bold">{estimatedPrice ? (+formatEther(estimatedPrice)).toFixed(6) : "0.001"} LYX</span></span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleMint}
                    className="btn btn-primary w-full"
                    disabled={!connectedAddress || isMinting}
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
                    <div className="text-sm">Price: <span className="font-bold">{estimatedPrice ? (+formatEther(estimatedPrice)).toFixed(6) : "0.001"} LYX</span></div>
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
          <div className="flex justify-center items-center">
            {!isConnected ? (
              <div className="my-12 flex flex-col items-center">
                <p className="text-xl font-medium">Please connect your wallet to interact with Loogies</p>
                <p className="mt-2 mb-4">Connect to the LUKSO testnet network to mint and view Loogies</p>
              </div>
            ) : loadingLoogies ? (
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
                        className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl shadow-md hover:shadow-lg transition-all relative"
                      >
                        {/* UniversalEverything.io link */}
                        <a 
                          href={`https://universaleverything.io/asset/${deployedContractData?.address}/tokenId/${loogie.id}?network=testnet`}
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
                        {/* UP Username section - only visible to token owner and for LSP8Loogies (not Basic) */}
                        {loogie.owner && 
                         connectedAddress && 
                         loogie.owner.toLowerCase() === connectedAddress.toLowerCase() && 
                         selectedContract === "LSP8Loogies" && (
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