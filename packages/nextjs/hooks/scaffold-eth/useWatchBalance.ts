import { useEffect } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { useBalance, useBlockNumber } from "wagmi";

/**
 * Parameters for the useWatchBalance hook
 */
type WatchBalanceParams = {
  address?: Address;
  chainId?: number;
  token?: Address;
};

/**
 * Wrapper around wagmi's useBalance hook. Updates data on every block change.
 * Enhanced to work better with LUKSO networks.
 */
export const useWatchBalance = (params: WatchBalanceParams) => {
  const { targetNetwork } = useTargetNetwork();
  const queryClient = useQueryClient();
  
  // If chainId is not explicitly provided, use the current targetNetwork's id
  const chainId = params.chainId || targetNetwork.id;
  
  // Watch blocks on the current network
  const { data: blockNumber } = useBlockNumber({ 
    watch: true, 
    chainId: chainId 
  });
  
  // Make sure we're using the right chainId for balance checks
  const balanceParams = { 
    ...params,
    chainId: chainId
  };
  
  const balanceResult = useBalance(balanceParams);

  useEffect(() => {
    // Invalidate this specific balance query when the block changes
    queryClient.invalidateQueries({ 
      queryKey: ['balance', { ...balanceParams }] 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return balanceResult;
};
