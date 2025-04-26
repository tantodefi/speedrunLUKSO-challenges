# 🚩 Challenge #5: 🖼️ Grid Mini Dapp Challenge

{challengeHeroImage}

In this challenge we're going to learn about how to make a LUKSO Grid Mini Dapp. The lukso grid is a new feature of Universal Profiles. It's technically a list of urls that is stored in the profiles metadata and sites like https://universaleverything.io/ open these urls in iframes and display them - with the added benefit of being able to pass additional web3 context betweeen the users (ie: the grid owner vs. the logged in UP user on universaleverything.io). This aditional context is given when we wrap our nextjs applicatio with an `UPProvider` component which we can get and initialize from the `up-provider` npm package https://www.npmjs.com/package/@lukso/up-provider

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

## Checkpoint 2: 💾 Build your own grid mini dapp 🖼️

Start up the local frontend by running:

```sh
yarn run start
```

Add the localhost:3000 url to your grid on https://universaleverything.io/

you should see the homepage of our se2 dapp open with a button to connect your UP in the top left corner of the grid

![alt text](grid-owner.png)

here we're showing you an example of how we're detecting a grid owner from the contextaccounts

you can see that once we connect we have access to another account which we can use for transactions 

![alt text](grid-owner-1.png)

so from here - you can basically take on eof the previous challenges examples and make it into a grid mini dapp. 

🌐 Create a grid mini-app from one of the previous challenges builds using the @lukso/up-provider package and host the grid app on Universal Everything profile. The goal here is to get one of the previous starter builds live as a grid mini-app, be creative and maybe even ship them to mainnet!

- [ ] basic LSP8 nft example
- [ ] basic LSP7 token vending machine
- [ ] basic staking machine
- [ ] basic svg nft LSP8 example

Don't be scared to add more features to these basic examples making them even more interesting mini dapps!

think about how to make interesting new UI's based on dapps whose when are loaded in the context of a grid maybe render differently - a great example of this is the official mini dapp example starter repo form the 
LUKSO team https://github.com/lukso-network/miniapp-nextjs-template

alternatively you can also build a new dapp from scratch - and search for ideas/code/inspiration on https://app.buidlguidl.com/builds

---

## Checkpoint 3: 🚢 Ship your frontend! 🚁

✏️ Edit your frontend config in packages/nextjs/scaffold.config.ts to change the targetNetwork to chains.luksoTestnet.

💻 View your frontend at http://localhost:3000/ and verify you see the correct network.

📡 When you are ready to ship the frontend app...

📦 Run yarn vercel to package up your frontend and deploy.

Follow the steps to deploy to Vercel. Once you log in (email, github, etc), the default options should work. It'll give you a public URL.

If you want to redeploy to the same production URL you can run yarn vercel --prod. If you omit the --prod flag it will deploy it to a preview/test URL.

🦊 Since we have deployed to a public testnet, you will now need to connect using a wallet you own or use a burner wallet. By default 🔥 burner wallets are only available on hardhat . You can enable them on every chain by setting onlyLocalBurnerWallet: false in your frontend config (scaffold.config.ts in packages/nextjs/)

Configuration of Third-Party Services for Production-Grade Apps.
By default, 🏗 Scaffold-ETH 2 provides predefined API keys for popular services such as Alchemy and Etherscan. This allows you to begin developing and testing your applications more easily, avoiding the need to register for these services.
This is great to complete your SpeedRunLUKSO.

For production-grade applications, it's recommended to obtain your own API keys (to prevent rate limiting issues). You can configure these at:

🔷ALCHEMY_API_KEY variable in packages/hardhat/.env and packages/nextjs/.env.local. You can create API keys from the Alchemy dashboard.

📃ETHERSCAN_API_KEY variable in packages/hardhat/.env with your generated API key. You can get your key here.

📃LUKSO-explorer_API_KEY variable in packages/hardhat/.env with your generated API key. You can get your key here.

💬 Hint: It's recommended to store env's for nextjs in Vercel/system env config for live apps and use .env.local for local testing.

## Checkpoint 4: 📜 Contract Verification

Run the yarn verify --network luksoTestnet command to verify your contracts on LUKSO testnet blockexplorer 🛰

👉 Search this address on LUKSO testnet blockexplorer to get the URL you submit along with your deployed dapp to 🏃‍♀️speedrunlukso.com.

---

_Create all the required Checkpoints for the Challenge, can also add Side Quests you think may be interesting to complete. Check other Challenges for inspiration._

### ⚔️ Side Quests


> 🏃 Head to your next challenge [here](https://speedrunlukso.com).

> 💬 Problems, questions, comments on the stack? Post them to the [Lukso Builders Telegram]()
