"use client";

import { useEffect, useState } from "react";
import { Address as AddressType, createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useChainId } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { notification } from "~~/utils/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
// Account index to use from generated hardhat accounts (same as in Faucet.tsx)
const FAUCET_ACCOUNT_INDEX = 0;

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useWatchBalance({ address });
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [faucetAddress, setFaucetAddress] = useState<AddressType>();
  
  // Set isMounted to true when component mounts on client and get faucet address
  useEffect(() => {
    setIsMounted(true);
    
    const getFaucetAddress = async () => {
      try {
        const accounts = await localWalletClient.getAddresses();
        setFaucetAddress(accounts[FAUCET_ACCOUNT_INDEX]);
      } catch (error) {
        console.error("Failed to get faucet address:", error);
        notification.error(
          <>
            <p className="font-bold mt-0 mb-1">Cannot connect to local provider</p>
            <p className="m-0">
              - Did you forget to run <code className="italic bg-base-300 text-base font-bold">yarn chain</code> ?
            </p>
          </>
        );
      }
    };
    
    if (chainId === hardhat.id) {
      getFaucetAddress();
    }
  }, [chainId]);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!faucetAddress || !address) {
      notification.error("Faucet address or your address not available");
      return;
    }
    
    try {
      setLoading(true);
      await faucetTxn({
        chain: hardhat,
        account: faucetAddress,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
      notification.error("Failed to send ETH from faucet");
    }
  };

  // Don't render anything during server-side rendering or if not on local network
  if (!isMounted || !chainId || chainId !== hardhat.id) {
    return null;
  }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <div
      className={
        !isBalanceZero
          ? "ml-1"
          : "ml-1 tooltip tooltip-bottom tooltip-secondary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:right-0"
      }
      data-tip="Grab funds from faucet"
    >
      <button
        className="btn btn-secondary dark:hover:bg-black/20 focus:bg-secondary hover:shadow-lg btn-sm px-2 rounded-full"
        onClick={sendETH}
        disabled={loading || !faucetAddress}
      >
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
