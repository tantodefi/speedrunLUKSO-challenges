import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const NFTDisplay = ({ tokenId }: { tokenId: string }) => {
  const { data: nftContract } = useScaffoldContract({
    contractName: "YourLSP8Collectible",
  });

  const { data: tokenURI } = useScaffoldContractRead({
    contractName: "YourLSP8Collectible",
    functionName: "tokenURI",
    args: [ethers.utils.hexZeroPad(tokenId, 32)], // Convert to bytes32
  });

  // ... rest of component code
}; 