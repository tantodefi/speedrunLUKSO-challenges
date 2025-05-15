import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">SpeedRunLUKSO</span>
          <span className="block text-4xl font-bold">Challenge #7: 🎁 SVG NFT</span>
        </h1>
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/hero.png"
            width="727"
            height="231"
            alt="challenge banner"
            className="rounded-xl border-4 border-primary"
          />
          <div className="max-w-3xl text-center text-lg">
            <p className="mt-8">
              🎨 Creating on-chain SVG NFTs is an exciting way to leverage the power of smart contracts for generating
              unique digital art. This challenge will have you build a contract that generates dynamic SVG images
              directly on the blockchain. Users will be able to mint their own unique NFTs with customizable SVG
              graphics and metadata.
            </p>
            <p>
              🌟 Use{" "}
              <Link href="/loogies" className="underline">
                Loogies
              </Link>{" "}
              as an example to guide your project. This will provide a solid foundation and inspiration for creating
              your own dynamic SVG NFTs.
            </p>
            <p>
            🫘 A fantastic example of a fully on-chain dynamic SVG NFT on LUKSO is{" "}
              <Link href="https://explorer.execution.mainnet.lukso.network/address/0x33517e5fedec388da59125fbabea6e2f6395c510?tab=contract" className="underline">
                Beans.sol
              </Link>{" "}
              you can checkout their code to learn how to display the SVGs in token metadata.
            </p>
            <p>
            🖼️ ALso make sure you checkout {" "}
              <Link href="https://burntpix.com/" className="underline">
              burntpix
              </Link>{" "}
              for some serious on-chain generative NFT inspiration.
            </p>
            <p className="mt-8">
              💬 Meet other builders working on this challenge and get help in the{" "}
              <a href="https://t.me/+mUeITJ5u7Ig0ZWJh" target="_blank" rel="noreferrer" className="underline">
                🎁 SVG NFT 🎫 Building Cohort
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
