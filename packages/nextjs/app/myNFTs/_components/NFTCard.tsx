import { useState } from "react";
import { Collectible } from "./MyHoldings";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  const [transferToAddress, setTransferToAddress] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract("YourLSP8Collectible");

  // LSP4 fields
  const meta = nft.LSP4Metadata;
  const imageUrl = meta?.images?.[0]?.url || "/nft-placeholder.png";
  const name = meta?.name || "NFT";
  const description = meta?.description || "";
  const attributes = meta?.attributes || [];

  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px] shadow-secondary">
      <figure className="relative">
        {/* eslint-disable-next-line  */}
        <img
          src={imageUrl}
          alt={name}
          className="h-60 min-w-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src = "/nft-placeholder.png";
          }}
        />
        <figcaption className="glass absolute bottom-4 left-4 p-4 w-25 rounded-xl">
          <span className="text-white ">
            # {nft.id ? `${String(nft.id).slice(0, 8)}...${String(nft.id).slice(-4)}` : ""}
          </span>
        </figcaption>
      </figure>
      <div className="card-body space-y-3">
        <h2 className="card-title text-lg font-bold">
          {name}
        </h2>
        <p className="text-xs text-gray-500">
          {description}
        </p>
        <div className="mt-2">
          {attributes && attributes.length > 0 && (
            <ul className="text-xs">
              {attributes.map((attr, idx) => (
                <li key={idx}>
                  <b>{attr.trait_type}:</b> {attr.value}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex space-x-3 mt-1 items-center">
          <span className="text-lg font-semibold">Owner : </span>
          <Address address={nft.owner} />
        </div>
        <div className="flex flex-col my-2 space-y-1">
          <span className="text-lg font-semibold mb-1">Transfer To: </span>
          <AddressInput
            value={transferToAddress}
            placeholder="receiver address"
            onChange={newValue => setTransferToAddress(newValue)}
          />
        </div>
        <div className="card-actions justify-end">
          <button
            className="btn btn-secondary btn-md px-8 tracking-wide"
            onClick={() => {
              try {
                writeContractAsync({
                  functionName: "transfer",
                  args: [nft.owner, transferToAddress, nft.id, true, "0x"],
                });
              } catch (err) {
                console.error("Error calling transferFrom function");
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
