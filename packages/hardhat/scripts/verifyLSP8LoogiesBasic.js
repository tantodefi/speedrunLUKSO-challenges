// Script to verify the LSP8LoogiesBasic contract on LUKSO Blockscout

async function main() {
  const contractAddress = "0x1a591150667ca86de0f8d48ada752115c2587826";
  
  // Constructor arguments when the contract was deployed
  // LSP8LoogiesBasic constructor takes name and symbol
  const constructorArgs = [
    "Loogies Basic", // name
    "LOOGB"          // symbol
  ];
  
  console.log("Verifying LSP8LoogiesBasic contract...");
  console.log("Contract address:", contractAddress);
  console.log("Constructor arguments:", constructorArgs);
  
  try {
    // Use the hardhat built-in verify task
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/LSP8LoogiesBasic.sol:LSP8LoogiesBasic",
    });
    
    console.log("Contract verified successfully! ✅");
    
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 