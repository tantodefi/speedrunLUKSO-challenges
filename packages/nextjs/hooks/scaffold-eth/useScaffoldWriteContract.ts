import { useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { MutateOptions } from "@tanstack/react-query";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { useAccount, useChainId, useContractWrite } from "wagmi";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useContractWrite hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param functionName - name of the function to be called
 * @param args - args to be passed to the function call
 * @param options - additional options
 */
export const useScaffoldWriteContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">
>(
  contractName: TContractName,
  functionName?: TFunctionName,
  args?: unknown[],
  options?: {
    value?: bigint;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    chainId?: number;
  }
) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  const wagmiContractWrite = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    functionName,
    args,
    ...options,
  });

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    const isBurnerWalletOnLocalNetwork = !chainId && !!address && targetNetwork.id === 31337;

    if (!chainId && !isBurnerWalletOnLocalNetwork) {
      notification.error("Please connect your wallet");
      return;
    }

    if (chainId && chainId !== targetNetwork.id && !isBurnerWalletOnLocalNetwork) {
      notification.error("You are on the wrong network");
      return;
    }

    // Ensure functionName is provided
    if (!variables.functionName) {
      notification.error("Function name is required for contract interaction");
      console.error("Missing functionName in contract call:", { contractName, variables });
      return;
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
      
      // Ensure consistent data between hook initialization and write
      const finalFunctionName = variables.functionName || functionName;
      
      if (!finalFunctionName) {
        throw new Error(`Function name is required. Neither the hook initialization nor the writeContract call provided a function name.`);
      }
      
      console.log(`Executing contract write for ${String(contractName)}.${String(finalFunctionName)}`);
      
      const makeWriteWithParams = async () => {
        if (!wagmiContractWrite.writeAsync) {
          throw new Error("writeAsync function is not available");
        }
        
        const result = await wagmiContractWrite.writeAsync();
        return result?.hash as `0x${string}`;
      };
      
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
      console.error(`Error in contract write to ${String(contractName)}:`, e);
      throw e;
    } finally {
      setIsMining(false);
    }
  };

  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    const isBurnerWalletOnLocalNetwork = !chainId && !!address && targetNetwork.id === 31337;

    if (!chainId && !isBurnerWalletOnLocalNetwork) {
      notification.error("Please connect your wallet");
      return;
    }
    
    if (chainId && chainId !== targetNetwork.id && !isBurnerWalletOnLocalNetwork) {
      notification.error("You are on the wrong network");
      return;
    }
    
    // Ensure functionName is provided
    if (!variables.functionName) {
      notification.error("Function name is required for contract interaction");
      console.error("Missing functionName in contract call:", { contractName, variables });
      return;
    }

    wagmiContractWrite.write?.();
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  };
};
