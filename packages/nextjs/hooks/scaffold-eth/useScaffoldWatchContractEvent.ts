import { useTargetNetwork } from "./useTargetNetwork";
import { Abi, ExtractAbiEventNames } from "abitype";
import { Log } from "viem";
import { useContractEvent } from "wagmi";
import { addIndexedArgsToEvent, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldEventConfig } from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useContractEvent hook which automatically loads (by name) the contract ABI and
 * address from the contracts present in deployedContracts.ts & externalContracts.ts
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.onLogs - the callback that receives events.
 */
export const useScaffoldWatchContractEvent = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  onLogs,
}: UseScaffoldEventConfig<TContractName, TEventName>) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { targetNetwork } = useTargetNetwork();

  const addIndexedArgsToLogs = (logs: Log[]) => logs.map(addIndexedArgsToEvent);
  
  return useContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi as Abi,
    chainId: targetNetwork.id,
    listener: (...args: any[]) => {
      // In wagmi v1.x, the listener gets the logs directly as multiple arguments
      // Convert args to logs array and then process
      const logs = args as Log[];
      onLogs(addIndexedArgsToLogs(logs) as Parameters<typeof onLogs>[0]);
    },
    eventName,
  });
};
