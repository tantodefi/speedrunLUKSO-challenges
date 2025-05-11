"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const LSP8Loogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [allLoogies, setAllLoogies] = useState<any[]>([]);
  const [page, setPage] = useState(1n);
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const perPage = 12n;

  // Get the price
  const { data: price } = useScaffoldReadContract({
    contractName: "LSP8Loogies",
    functionName: "price",
  });

  // Get the total supply
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "LSP8Loogies",
    functionName: "totalSupply",
  });

  // Handle minting
  const { writeContractAsync } = useScaffoldWriteContract("LSP8Loogies");

  // Generate array of token IDs for the current page
  const tokenIds = useState(() => {
    if (!totalSupply) return [];
    
    const tokens = [];
    const startIndex = Number(totalSupply) - Number(perPage) * (Number(page) - 1);
    const endIndex = Math.max(startIndex - Number(perPage), 0);
    
    for (let i = startIndex; i > endIndex && i > 0; i--) {
      // Convert to bytes32 format for LSP8
      tokens.push(`0x${i.toString().padStart(64, '0')}`);
    }
    
    return tokens;
  })[0];

  // Effect to load tokens when totalSupply or page changes
  useEffect(() => {
    const loadTokens = async () => {
      if (!totalSupply) return;
      
      setLoadingLoogies(true);
      setAllLoogies([]);
      
      // We'll use fetch directly to call the contract
      // This is just a placeholder - actual implementation would depend on
      // your backend API or how you integrate with the blockchain
      try {
        // In a real implementation, you'd make calls to your contract
        // through a JSON-RPC provider or a service like Infura/Alchemy
        
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
  }, [totalSupply, page, tokenIds, connectedAddress]);

  // Update page when user changes it
  const handlePageChange = (newPage: bigint) => {
    setPage(newPage);
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
              onClick={async () => {
                try {
                  await writeContractAsync({
                    functionName: "mintItem",
                    value: price,
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
              className="btn btn-primary"
              disabled={!connectedAddress || !price}
            >
              Mint Now for {price ? (+formatEther(price)).toFixed(6) : "-"} ETH
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