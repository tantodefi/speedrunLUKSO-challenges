import { useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { MutateOptions } from "@tanstack/react-query";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { useAccount, useContractWrite } from "wagmi";
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
  const { chainId } = useAccount();
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

    if (!chainId) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chainId !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
      const makeWriteWithParams = () => wagmiContractWrite.writeAsync?.();
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
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
    if (!chainId) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chainId !== targetNetwork.id) {
      notification.error("You are on the wrong network");
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
