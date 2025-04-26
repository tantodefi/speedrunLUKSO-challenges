# 🚩 Challenge #5: 🖼️ Grid Mini Dapp Challenge

{challengeHeroImage}

A in this challenge we're going to learn about how to make a LUKSO Grid Mini Dapp. The lukso grid is a new feature of Universal Profiles. It's technically a list of urls that is stored in the profiles metadata and sites like https://universaleverything.io/ open these urls in iframes and display them - with the added benefit of being able to pass additional web3 context betweeen the users (ie: the grid owner vs. the logged in UP user on universaleverything.io). This aditional context is given when we wrap our nextjs applicatio with an `UPProvider` component which we can get and initialize from the `up-provider` npm package https://www.npmjs.com/package/@lukso/up-provider

🌟 The final deliverable is an app that works with LUKSO Universla Profiles and uses the up-provider to make it a grid mini app. We encourage you building something completely new with the new additional contexts accounts available to the dapp. If your struggling for ideas, then you can convert one of the previous challenge examples into a grid mini dapp. Be creative and your own creatie spin to them and mayeb even take them to mainnet!
Deploy your contracts to a testnet then build and upload your app to a public web server. Submit the url on [SpeedRunLUKSO.com](https://speedrunlukso.com)!

💬 Meet other builders working on this challenge and get help in the {LuksoBuildersTelegramLink}

---

## Checkpoint 0: 📦 Environment 📚

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

Then download the challenge to your computer and install dependencies by running:

```sh
git clone https://github.com/scaffold-eth/se-2-challenges.git {challengeName}
cd {challengeName}
git checkout Challenge-5-grid-mini-dapp
yarn install
```

> in the same terminal, start your local network (a blockchain emulator in your computer):

```sh
yarn chain
```

> in a second terminal window, 🛰 deploy your contract (locally):

```sh
cd <challenge_folder_name>
yarn deploy
```

> in a third terminal window, start your 📱 frontend:

```sh
cd <challenge_folder_name>
yarn start
```

📱 Open http://localhost:3000 to see the app.

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend, update your current contracts with changes, or re-deploy it to get a fresh contract address.

🔏 Now you are ready to edit your smart contract `{mainContractName.sol}` in `packages/hardhat/contracts`

---

## Checkpoint 1: 🆙 Add the UPProvider 🖼️

### Integrating @lukso/up-provider (Checkpoint 1)

Follow these steps to add Universal Profiles support to your Next.js app using the [@lukso/up-provider](https://www.npmjs.com/package/@lukso/up-provider):

1. **Install the up-provider package**
   ```sh
   npm install @lukso/up-provider --legacy-peer-deps
   ```

2. **Create a UpProvider component** in `packages/nextjs/components/UpProvider.tsx`:
   ```tsx
   import React, { createContext, useEffect, useState, ReactNode } from "react";
   import { UPProvider as LuksoUPProvider } from "@lukso/up-provider";

   export const UPContext = createContext({
     contextAccounts: [] as string[],
     mainAccount: "",
   });

   interface UpProviderProps {
     children: ReactNode;
   }

   export const UpProvider: React.FC<UpProviderProps> = ({ children }) => {
     const [contextAccounts, setContextAccounts] = useState<string[]>([]);
     const [mainAccount, setMainAccount] = useState<string>("");

     useEffect(() => {
       const up = new LuksoUPProvider();
       up.on("accountsChanged", (accounts: string[]) => {
         console.log("[UpProvider] Context accounts changed:", accounts);
         setContextAccounts(accounts);
       });
       up.on("mainAccountChanged", (account: string) => {
         console.log("[UpProvider] Main account changed:", account);
         setMainAccount(account);
       });
       up.getAccounts().then((accounts: string[]) => {
         console.log("[UpProvider] Initial context accounts:", accounts);
         setContextAccounts(accounts);
       });
       up.getMainAccount().then((account: string) => {
         console.log("[UpProvider] Initial main account:", account);
         setMainAccount(account);
       });
       return () => {
         up.removeAllListeners();
       };
     }, []);

     return (
       <UPContext.Provider value={{ contextAccounts, mainAccount }}>
         {children}
       </UPContext.Provider>
     );
   };
   ```

3. **Wrap your app with UpProvider** in `packages/nextjs/components/ScaffoldEthAppWithProviders.tsx`:
   ```tsx
   import { UpProvider } from "./UpProvider";
   // ...
   return (
     <UpProvider>
       {/* other providers */}
       <WagmiProvider config={wagmiConfig}>
         <QueryClientProvider client={queryClient}>
           <ProgressBar />
           <RainbowKitProvider /* ... */>
             <ScaffoldEthApp>{children}</ScaffoldEthApp>
           </RainbowKitProvider>
         </QueryClientProvider>
       </WagmiProvider>
     </UpProvider>
   );
   ```

4. **Consume UP accounts anywhere in your app:**
   ```tsx
   import { useContext } from "react";
   import { UPContext } from "./UpProvider";
   const { contextAccounts, mainAccount } = useContext(UPContext);
   ```

- The `UpProvider` component logs all account changes to the console and updates context state.
- If you have dependency conflicts, use `--legacy-peer-deps` during installation.
- Make sure all children that need UP accounts are wrapped by the `UpProvider`.

---



_Other commonly used Checkpoints (check one Challenge and adapt the texts for your own):_

## Checkpoint 2: 💾 Build your own grid mini dapp 🖼️

## Checkpoint 3: 🚢 Ship your frontend! 🚁

## Checkpoint 4: 📜 Contract Verification

---

_Create all the required Checkpoints for the Challenge, can also add Side Quests you think may be interesting to complete. Check other Challenges for inspiration._

### ⚔️ Side Quests


> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [Lukso Builders Telegram]()
