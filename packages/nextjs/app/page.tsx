"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useUpProvider } from "../components/LuksoProvider";
import ERC725 from "@erc725/erc725.js";
// Use the official LSP3ProfileMetadata schema
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

const Home: NextPage = () => {
  // Logging to confirm re-renders and context updates
  const { contextAccounts = [], accounts = [] } = useUpProvider();
  useEffect(() => {
    console.log("Rendering Home", { contextAccounts, accounts });
  }, [contextAccounts, accounts]);
  const gridOwner = contextAccounts[0] || "None";
  const connectedUP = accounts[0] || "None";

  // Defensive: Only fetch profiles if address is valid
  // Helper to check if address is a valid 0x address
  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // 2. State for both UP profiles
  const [ownerProfile, setOwnerProfile] = useState<{ username: string; image: string; loading: boolean }>({ username: '', image: '', loading: false });
  const [connectedProfile, setConnectedProfile] = useState<{ username: string; image: string; loading: boolean }>({ username: '', image: '', loading: false });



  // 3. Fetch profile for a given address
  async function fetchProfile(address: string): Promise<{ username: string; image: string }> {
    if (!isValidAddress(address)) return { username: '', image: '' };
    try {
      const rpcUrl = "https://rpc.testnet.lukso.network";
      const erc725 = new ERC725(LSP3ProfileSchema, address, rpcUrl);
      const profileData = await erc725.getData("LSP3Profile");
      if (profileData && typeof profileData.value === 'object' && profileData.value !== null && 'LSP3Profile' in profileData.value) {
        // @ts-ignore
        const lsp3 = profileData.value.LSP3Profile;
        const username = lsp3?.name || '';
        const imgs = lsp3?.profileImage;
        const image = imgs && imgs.length > 0 && imgs[0].url ? imgs[0].url : '';
        return { username, image };
      }
    } catch (err) {}
    return { username: '', image: '' };
  }

  // 4. Fetch both profiles on change, but only for valid addresses
  useEffect(() => {
    if (isValidAddress(gridOwner)) {
      setOwnerProfile(p => ({ ...p, loading: true }));
      fetchProfile(gridOwner).then(res => setOwnerProfile({ ...res, loading: false }));
    } else {
      setOwnerProfile({ username: '', image: '', loading: false });
    }
    if (isValidAddress(connectedUP)) {
      setConnectedProfile(p => ({ ...p, loading: true }));
      fetchProfile(connectedUP).then(res => setConnectedProfile({ ...res, loading: false }));
    } else {
      setConnectedProfile({ username: '', image: '', loading: false });
    }
  }, [gridOwner, connectedUP]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {contextAccounts.length === 0 && (
        <div className="mb-8 p-4 rounded-lg bg-warning text-warning-content shadow w-full max-w-xl">
          Loading Universal Profile context... (Make sure your UP extension is installed and connected)
        </div>
      )}
      <div className="mb-8 p-4 rounded-lg bg-base-200 shadow w-full max-w-xl">
        <div className="flex flex-col gap-6">
          {/* Grid Owner Section */}
          <div>
            <div className="font-bold">Grid Owner Address:</div>
            <div className="break-all text-base-content/80">{gridOwner}</div>
            {ownerProfile.username && (
              <div className="mt-2">
                <span className="font-bold">Username: </span>
                <span>{ownerProfile.username}</span>
              </div>
            )}
            {ownerProfile.image && (
              <div className="mt-2">
                <img src={ownerProfile.image} alt="Grid Owner Profile" className="w-20 h-20 rounded-full border" />
              </div>
            )}
          </div>
          {/* Connected UP Section */}
          <div>
            <div className="font-bold">Connected UP Address:</div>
            <div className="break-all text-base-content/80">{connectedUP}</div>
            {connectedProfile.username && (
              <div className="mt-2">
                <span className="font-bold">Username: </span>
                <span>{connectedProfile.username}</span>
              </div>
            )}
            {connectedProfile.image && (
              <div className="mt-2">
                <img src={connectedProfile.image} alt="Connected UP Profile" className="w-20 h-20 rounded-full border" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">SpeedRunLUKSO</span>
          <span className="block text-4xl font-bold">Challenge #5: Grid Mini Dapp Challenge </span>
        </h1>
        <p className="text-center text-lg">
          This homepage demonstrates how to listen to Universal Profile (UP) events and fetch LSP3Profile data using <code>@erc725/erc725.js</code>.
        </p>
        <p className="text-center text-lg mt-2">
          Edit <code>packages/nextjs/app/page.tsx</code> to customize this logic for your dapp!
        </p>
      </div>
    </div>
  );
};

export default Home;
