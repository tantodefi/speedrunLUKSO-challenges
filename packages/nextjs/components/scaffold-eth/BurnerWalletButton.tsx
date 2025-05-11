"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import scaffoldConfig from "~~/scaffold.config";

export const BurnerWalletButton = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  // Add state to track client-side rendering
  const [isMounted, setIsMounted] = useState(false);
  
  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const isLocalNetwork = targetNetwork.id === 31337;
  const shouldShowBurnerWallet = !scaffoldConfig.onlyLocalBurnerWallet || isLocalNetwork;

  const handleConnectBurner = useCallback(async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      
      // If we're already connected to something, disconnect first
      if (connectedAddress) {
        await disconnectAsync();
      }

      // Find the burner wallet connector
      const burnerConnector = connectors.find(c => c.id === "burner-wallet");
      
      if (burnerConnector) {
        // Try to connect using the burner connector
        try {
          await connectAsync({ connector: burnerConnector });
          console.log("Connected with burner wallet!");
        } catch (connectError) {
          console.error("Failed to connect with burner wallet:", connectError);
        }
      } else {
        console.error("No burner wallet connector found");
      }
    } catch (error) {
      console.error("Error in burner wallet connection:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [connectedAddress, connectors, connectAsync, disconnectAsync, isConnecting]);

  // Don't render anything during server-side rendering or if conditions aren't met
  if (!isMounted || connectedAddress || !shouldShowBurnerWallet) {
    return null;
  }

  return (
    <button 
      className="btn btn-primary btn-sm ml-2"
      onClick={handleConnectBurner}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Use Burner"}
    </button>
  );
}; 