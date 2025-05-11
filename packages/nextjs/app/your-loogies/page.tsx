"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

const YourLoogies: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [yourLoogies, setYourLoogies] = useState<any[]>();
  const [loadingLoogies, setLoadingLoogies] = useState(true);

  const { data: price } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "totalSupply",
  });

  const { data: balance } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  const { data: contract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  useEffect(() => {
    const updateAllLoogies = async () => {
      setLoadingLoogies(true);
      if (contract && balance && connectedAddress) {
        const collectibleUpdate = [];
        for (let tokenIndex = 0n; tokenIndex < balance; tokenIndex++) {
          try {
            const tokenId = await contract.read.tokenOfOwnerByIndex([connectedAddress, tokenIndex]);
            const tokenURI = await contract.read.tokenURI([tokenId]);
            
            // Parse base64 encoded data
            // Format: data:application/json;base64,<base64_data>
            const base64Data = tokenURI.substring(29);
            const jsonManifestString = atob(base64Data);

            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              
              // Parse the SVG from base64 if it exists
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
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log("Collectible Update: ", collectibleUpdate);
        setYourLoogies(collectibleUpdate);
      }
      setLoadingLoogies(false);
    };
    updateAllLoogies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, connectedAddress, Boolean(contract)]);

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
          <div className="flex flex-col justify-center items-center mt-4 space-x-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default YourLoogies;
