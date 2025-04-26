# 🚩 Challenge 6: 🖼️ Grid Mini Dapp Advanced Challenge

{challengeHeroImage}

In the last challenge we learnt all about the grid mini dapp and how to use the up-provider. In this challenge we're going to continue on that theme and make a new grid mini dapp.

🌟 The final deliverable is an app that works with LUKSO Universal Profiles and uses the up-provider to make it a grid mini app. We encourage you building something completely new with the new additional contexts accounts available to the dapp. If your struggling for ideas,you can find some inspiration here https://app.buidlguidl.com/builds. Be creative and your own creatie spin to them and maybe even take them to mainnet!
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

## Checkpoint 1: 💾 Build your own grid mini dapp 🖼️

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
