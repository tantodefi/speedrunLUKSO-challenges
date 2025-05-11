import { NextResponse } from "next/server";
import { Address, Chain, createPublicClient, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";

// Helper function to safely serialize BigInt values
const serializeResult = (result: unknown): unknown => {
  if (result === null || result === undefined) {
    return result;
  }
  
  // Handle BigInt values
  if (typeof result === 'bigint') {
    return result.toString();
  }
  
  // Handle arrays
  if (Array.isArray(result)) {
    // Check if this might be an LSP8 token ID array (all numbers or bigints)
    const allNumbers = result.every(item => 
      typeof item === 'bigint' || 
      (typeof item === 'number') ||
      (typeof item === 'string' && !isNaN(Number(item)))
    );
    
    if (allNumbers) {
      // Format in a consistent way with numeric values
      return result.map(item => {
        if (typeof item === 'bigint') {
          return item.toString();
        }
        return item;
      });
    }
    
    // Regular array serialization
    return result.map(item => serializeResult(item));
  }
  
  // Handle objects (excluding null)
  if (typeof result === 'object') {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result)) {
      serialized[key] = serializeResult(value);
    }
    return serialized;
  }
  
  // Return primitive values as is
  return result;
};

export const POST = async (req: Request) => {
  try {
    const { chainId, contractAddress, abi, functionName, args } = await req.json();

    if (!chainId || !contractAddress || !abi || !functionName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const targetNetworks = scaffoldConfig.targetNetworks;
    const targetNetwork = targetNetworks.find(network => network.id === chainId);

    if (!targetNetwork) {
      console.error(`Network with chainId ${chainId} not found in config. Available networks:`, 
                    targetNetworks.map(n => ({ id: n.id, name: n.name })));
      return NextResponse.json({ error: "Target network not configured" }, { status: 400 });
    }

    console.log("Using network:", {
      id: targetNetwork.id,
      name: targetNetwork.name,
      rpcUrl: targetNetwork.rpcUrls.default.http[0]
    });

    // Create a public client for the specific chain
    let publicClient;
    try {
      publicClient = createPublicClient({
        chain: targetNetwork as Chain,
        transport: http(targetNetwork.rpcUrls.default.http[0], {
          timeout: 15000, // Increase timeout to 15 seconds
          fetchOptions: {
            cache: 'no-store',
          },
        }),
      });
    } catch (clientError: any) {
      console.error("Error creating public client:", clientError);
      return NextResponse.json({ 
        error: "Failed to create RPC client", 
        details: clientError.message 
      }, { status: 500 });
    }

    // Log the contract call parameters for debugging
    console.log("Contract call params:", {
      address: contractAddress,
      functionName,
      argsCount: args ? args.length : 0
    });

    // Call the contract function
    try {
      const result = await publicClient.readContract({
        address: contractAddress as Address,
        abi,
        functionName,
        args: args || [],
      });

      // Check if result should be handled specially (for LSP8 token IDs)
      let serializedResult = serializeResult(result);
      
      // Special handling for LSP8 getAllTokenIds vs totalSupply
      if (functionName === 'getAllTokenIds' && Array.isArray(serializedResult)) {
        console.log(`Formatting getAllTokenIds response for better display`);
      }

      return NextResponse.json({ result: serializedResult });
    } catch (contractError: any) {
      console.error("Contract call error:", contractError);
      // More detailed error for contract call failures
      return NextResponse.json({ 
        error: contractError.message || "Contract call failed",
        details: {
          code: contractError.code,
          data: contractError.data
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in read-contract API route:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
} 