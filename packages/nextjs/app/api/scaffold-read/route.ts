import { NextRequest, NextResponse } from "next/server";
import { readContract } from "@wagmi/core";
import { Abi } from "abitype";
import { contracts } from "~~/utils/scaffold-eth/contract";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractName = searchParams.get("contractName");
    const functionName = searchParams.get("functionName");
    const argsParam = searchParams.get("args") || "[]";
    
    if (!contractName || !functionName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    
    // Parse args - could be single value or array
    let args;
    try {
      // Check if it starts with [ to determine if it's array syntax
      if (argsParam.trim().startsWith("[")) {
        args = JSON.parse(argsParam);
      } else {
        // It's a single value
        // For BigInts, convert string like "123" to BigInt
        if (argsParam.match(/^\d+$/)) {
          args = [BigInt(argsParam)];
        } else if (argsParam.match(/^0x[0-9a-fA-F]+$/)) {
          // For hex strings (like token IDs)
          args = [argsParam];
        } else {
          args = [argsParam];
        }
      }
    } catch (e) {
      console.error("Failed to parse args:", e);
      args = [argsParam]; // Fallback to treating it as a simple string
    }
    
    // Get all contracts for the current chain
    const targetNetworkId = 31337; // Default to localhost
    const allContracts = contracts?.[targetNetworkId];
    
    if (!allContracts || !allContracts[contractName]) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    
    const contractInfo = allContracts[contractName];
    
    const result = await readContract({
      address: contractInfo.address,
      abi: contractInfo.abi as Abi,
      functionName,
      args,
    });
    
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Error in scaffold-read API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 