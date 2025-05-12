import { useEffect, useState } from "react";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import { 
  LSP0_INTERFACE_ID, 
  LSP3_PROFILE_NAME_KEY, 
  LSP3_PROFILE_IMAGE_KEY, 
  LSP3_PROFILE_DESCRIPTION_KEY 
} from "~~/constants/luksoConstants";

// Define interface for UP metadata
interface UniversalProfileMetadata {
  name: string | null;
  description: string | null;
  avatar: string | null;
  links: Array<{ title: string; url: string }> | null;
  tags: string[] | null;
}

/**
 * Hook to fetch Universal Profile metadata for a given address
 * Will attempt to get metadata using LSP1 & LSP3 standards
 * Falls back to ENS if the address is not a Universal Profile
 */
export const useUniversalProfile = (address?: Address) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUniversalProfile, setIsUniversalProfile] = useState(false);
  const [upMetadata, setUpMetadata] = useState<UniversalProfileMetadata | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchUniversalProfileMetadata = async () => {
      if (!address || !isAddress(address)) {
        setUpMetadata(null);
        setIsUniversalProfile(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First check if the address is a contract
        const isContract = await publicClient.getBytecode({ address });
        
        if (!isContract) {
          setIsUniversalProfile(false);
          setUpMetadata(null);
          setIsLoading(false);
          return;
        }

        // Check if the address supports LSP0 interface (Universal Profile)
        try {
          // Try to call supportsInterface function to check for LSP0
          const supportsLSP0 = await publicClient.readContract({
            address,
            abi: [{
              name: "supportsInterface",
              type: "function",
              inputs: [{ name: "interfaceId", type: "bytes4" }],
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "view"
            }],
            functionName: "supportsInterface",
            args: [LSP0_INTERFACE_ID],
          });

          setIsUniversalProfile(!!supportsLSP0);

          if (supportsLSP0) {
            // Fetch profile metadata using getData function from LSP3 Profile
            const fetchedName = await publicClient.readContract({
              address,
              abi: [{
                name: "getData",
                type: "function",
                inputs: [{ name: "dataKey", type: "bytes32" }],
                outputs: [{ name: "dataValue", type: "bytes" }],
                stateMutability: "view"
              }],
              functionName: "getData",
              args: [LSP3_PROFILE_NAME_KEY],
            });

            // Fetch profile image
            const fetchedImage = await publicClient.readContract({
              address,
              abi: [{
                name: "getData",
                type: "function",
                inputs: [{ name: "dataKey", type: "bytes32" }],
                outputs: [{ name: "dataValue", type: "bytes" }],
                stateMutability: "view"
              }],
              functionName: "getData",
              args: [LSP3_PROFILE_IMAGE_KEY],
            });

            const fetchedDescription = await publicClient.readContract({
              address,
              abi: [{
                name: "getData",
                type: "function",
                inputs: [{ name: "dataKey", type: "bytes32" }],
                outputs: [{ name: "dataValue", type: "bytes" }],
                stateMutability: "view"
              }],
              functionName: "getData",
              args: [LSP3_PROFILE_DESCRIPTION_KEY],
            });

            // Convert the returned bytes to a string
            const name = fetchedName ? new TextDecoder().decode(Buffer.from(fetchedName.slice(2), 'hex')) : null;
            const avatar = fetchedImage ? new TextDecoder().decode(Buffer.from(fetchedImage.slice(2), 'hex')) : null;
            const description = fetchedDescription ? new TextDecoder().decode(Buffer.from(fetchedDescription.slice(2), 'hex')) : null;

            // Set the UP metadata
            setUpMetadata({
              name,
              avatar,
              description,
              links: null,
              tags: null
            });
          }
        } catch (err) {
          console.error("Error checking if address is a Universal Profile:", err);
          setIsUniversalProfile(false);
          setUpMetadata(null);
        }
      } catch (err) {
        console.error("Error fetching Universal Profile metadata:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsUniversalProfile(false);
        setUpMetadata(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversalProfileMetadata();
  }, [address, publicClient]);

  return {
    isLoading,
    isUniversalProfile,
    upMetadata,
    error,
  };
}; 