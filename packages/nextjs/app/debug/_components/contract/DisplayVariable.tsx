"use client";

import { useEffect, useState, useCallback } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { displayTxResult } from "./utilsDisplay";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useTokenDisplay } from "~~/hooks/scaffold-eth/useTokenDisplay";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { normalizeTokenIds } = useTokenDisplay();
  const [result, setResult] = useState<unknown>();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { showAnimation } = useAnimationConfig(result);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/read-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chainId: targetNetwork.id,
          contractAddress,
          abi,
          functionName: abiFunction.name,
          args: [] // no arguments for variables
        }),
        // Prevent browser caching
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error: ${response.status}` }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Special handling for LSP8 token IDs for consistent display
      let processedResult = data.result;
      
      // Apply special normalization for token-related functions
      if (abiFunction.name === 'getAllTokenIds' || abiFunction.name === 'tokenOfOwnerByIndex') {
        processedResult = normalizeTokenIds(data.result);
      }
      
      setResult(processedResult);
      // Reset retry count on success
      setRetryCount(0);
    } catch (error: any) {
      const parsedError = getParsedError(error);
      setError(parsedError);
      if (retryCount === 0) {
        notification.error(parsedError);
      }
      console.error("Error fetching contract data:", error);
    } finally {
      setIsFetching(false);
    }
  }, [contractAddress, abiFunction.name, targetNetwork.id, abi, retryCount, normalizeTokenIds]);

  // Auto-retry once if there's an error
  useEffect(() => {
    if (error && retryCount === 0) {
      const timer = setTimeout(() => {
        setRetryCount(1);
        fetchData();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, fetchData]);

  useEffect(() => {
    fetchData();
  }, [contractAddress, abiFunction.name, refreshDisplayVariables, targetNetwork.id, fetchData]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center">
        <h3 className="font-medium text-lg mb-0 break-all">{abiFunction.name}</h3>
        <button className="btn btn-ghost btn-xs" onClick={handleRetry}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="opacity-80 font-medium flex flex-col items-start">
        <div>
          {error ? (
            <div className="text-error text-sm break-all">
              Error: {error}
              {retryCount > 0 && <span className="text-warning ml-1">(Retried {retryCount}x)</span>}
            </div>
          ) : (
            <div
              className={`break-all block transition bg-transparent ${
                showAnimation ? "bg-warning rounded-sm animate-pulse-fast" : ""
              }`}
            >
              {displayTxResult(result)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
