"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { getTokenPrice, multiplyTo1e18 } from "~~/utils/scaffold-eth/priceInWei";

const TokenVendor: NextPage = () => {
  const [toAddress, setToAddress] = useState("");
  const [tokensToSend, setTokensToSend] = useState("");
  const [tokensToBuy, setTokensToBuy] = useState<string | bigint>("");
  const [isApproved, setIsApproved] = useState(false);
  const [tokensToSell, setTokensToSell] = useState<string>("");

  const { address } = useAccount();
  // LSP4TokenName key (see https://docs.lukso.tech/standards/universal-profile/lsp4-digital-asset-metadata/#lsp4-metadata-keys)
  const LSP4TokenName =
    "0xdcafbab2e0b1b6e0a8e7b7a8e0b1b6e0a8e7b7a8e0b1b6e0a8e7b7a8e0b1b6e0";
  const { data: yourTokenNameHex } = useScaffoldReadContract({
    contractName: "YourLSP7Token",
    functionName: "getData",
    args: [LSP4TokenName],
  });
  function hexToUtf8(hex?: string) {
    if (!hex) return "...";
    try {
      // Remove 0x and decode
      return decodeURIComponent(
        hex
          .replace(/^0x/, "")
          .match(/.{1,2}/g)
          ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
          .join("") || "..."
      );
    } catch (e) {
      return "...";
    }
  }
  const yourTokenName = hexToUtf8(yourTokenNameHex as string);


  // LSP4TokenSymbol key (see https://docs.lukso.tech/standards/universal-profile/lsp4-digital-asset-metadata/#lsp4-metadata-keys)
  const LSP4TokenSymbol =
    "0x3ae85a3f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f";
  const { data: yourTokenSymbolHex } = useScaffoldReadContract({
    contractName: "YourLSP7Token",
    functionName: "getData",
    args: [LSP4TokenSymbol],
  });
  const yourTokenSymbol = hexToUtf8(yourTokenSymbolHex as string);


  const { data: yourTokenBalance } = useScaffoldReadContract({
    contractName: "YourLSP7Token",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: vendorContractData } = useDeployedContractInfo("Vendor");
  const { writeContractAsync: writeVendorAsync } = useScaffoldWriteContract("Vendor");
  const { writeContractAsync: writeYourTokenAsync } = useScaffoldWriteContract("YourLSP7Token");

  const { data: vendorTokenBalance } = useScaffoldReadContract({
    contractName: "YourLSP7Token",
    functionName: "balanceOf",
    args: [vendorContractData?.address],
  });

  const { data: vendorEthBalance } = useWatchBalance({ address: vendorContractData?.address });

  const { data: tokensPerEth } = useScaffoldReadContract({
    contractName: "Vendor",
    functionName: "tokensPerEth",
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex flex-col items-center bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-24 w-full max-w-lg">
          <div className="text-2xl font-bold mb-2">
            {yourTokenName ?? "..."}
          </div>
          <div className="text-xl">
            Your token balance:{" "}
            <div className="inline-flex items-center justify-center">
              {parseFloat(formatEther(yourTokenBalance || 0n)).toFixed(4)}
              <span className="font-bold ml-1">{yourTokenSymbol}</span>
            </div>
          </div>
          {/* Vendor Balances */}
          <hr className="w-full border-secondary my-3" />
          <div>
            Vendor token balance:{" "}
            <div className="inline-flex items-center justify-center">
              {Number(formatEther(vendorTokenBalance || 0n)).toFixed(4)}
              <span className="font-bold ml-1">{yourTokenSymbol}</span>
            </div>
          </div>
          <div>
            Vendor eth balance: {Number(formatEther(vendorEthBalance?.value || 0n)).toFixed(4)}
            <span className="font-bold ml-1">ETH</span>
          </div>
        </div>

        {/* Buy Tokens */}
        <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
          <div className="text-xl">Buy tokens</div>
          <div>{tokensPerEth?.toString() || 0} tokens per ETH</div>

          <div className="w-full flex flex-col space-y-2">
            <IntegerInput
              placeholder="amount of tokens to buy"
              value={tokensToBuy.toString()}
              onChange={value => setTokensToBuy(value)}
              disableMultiplyBy1e18
            />
          </div>

          <button
            className="btn btn-secondary mt-2"
            onClick={async () => {
              try {
                await writeVendorAsync({ functionName: "buyTokens", value: getTokenPrice(tokensToBuy, tokensPerEth) });
              } catch (err) {
                console.error("Error calling buyTokens function");
              }
            }}
          >
            Buy Tokens
          </button>
        </div>

        {!!yourTokenBalance && (
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
            <div className="text-xl">Transfer tokens</div>
            <div className="w-full flex flex-col space-y-2">
              <AddressInput placeholder="to address" value={toAddress} onChange={value => setToAddress(value)} />
              <IntegerInput
                placeholder="amount of tokens to send"
                value={tokensToSend}
                onChange={value => setTokensToSend(value as string)}
                disableMultiplyBy1e18
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  await writeYourTokenAsync({
                    functionName: "transfer",
                    args: [address, toAddress, multiplyTo1e18(tokensToSend), true, "0x"],
                  });
                } catch (err) {
                  console.error("Error calling transfer function");
                }
              }}
            >
              Send Tokens
            </button>
          </div>
        )}

        {/* Sell Tokens - LSP7 uses authorizeOperator instead of approve */}
        {!!yourTokenBalance && (
          <div className="flex flex-col items-center space-y-4 bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 mt-8 w-full max-w-lg">
            <div className="text-xl">Sell tokens</div>
            <div>{tokensPerEth?.toString() || 0} {yourTokenSymbol ?? "..."} per ETH</div>

            <div className="w-full flex flex-col space-y-2">
              <IntegerInput
                placeholder="amount of tokens to sell"
                value={tokensToSell}
                onChange={value => setTokensToSell(value as string)}
                disabled={isApproved}
                disableMultiplyBy1e18
              />
            </div>

            <div className="flex gap-4">
              <button
                className={`btn ${isApproved ? "btn-disabled" : "btn-secondary"}`}
                onClick={async () => {
                  try {
                    await writeYourTokenAsync({
                      functionName: "authorizeOperator",
                      args: [vendorContractData?.address, multiplyTo1e18(tokensToSell), "0x"],
                    });
                    setIsApproved(true);
                  } catch (err) {
                    console.error("Error calling authorizeOperator function");
                  }
                }}
              >
                Authorize Tokens
              </button>

              <button
                className={`btn ${isApproved ? "btn-secondary" : "btn-disabled"}`}
                onClick={async () => {
                  try {
                    await writeVendorAsync({ functionName: "sellTokens", args: [multiplyTo1e18(tokensToSell)] });
                    setIsApproved(false);
                  } catch (err) {
                    console.error("Error calling sellTokens function");
                  }
                }}
              >
                Sell Tokens
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TokenVendor;
