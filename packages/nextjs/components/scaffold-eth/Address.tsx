"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { hardhat } from "viem/chains";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useUniversalProfile } from "~~/hooks/scaffold-eth/useUniversalProfile";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

/**
 * Displays an address with a Blockie image, or Universal Profile/ENS avatar if available.
 * This component prioritizes Universal Profile data, then falls back to ENS if not available.
 */
export const Address = ({ address, disableAddressLink, format, size = "base" }: AddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { targetNetwork } = useTargetNetwork();
  
  // Try to get Universal Profile metadata first
  const { isUniversalProfile, upMetadata } = useUniversalProfile(checkSumAddress);

  // Only try ENS if not a LUKSO Universal Profile
  const { data: fetchedEns } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    enabled: isAddress(checkSumAddress ?? "") && !isUniversalProfile,
  });
  
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns ? normalize(fetchedEns) : undefined,
    chainId: 1,
    enabled: Boolean(fetchedEns) && !isUniversalProfile,
    gcTime: 30_000,
  });

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  // Skeleton UI
  if (!checkSumAddress) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);
  let displayAddress = checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);

  // Use Universal Profile name, then ENS, or formatted address 
  if (isUniversalProfile && upMetadata?.name) {
    displayAddress = upMetadata.name;
  } else if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = checkSumAddress;
  }

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {isUniversalProfile && upMetadata?.avatar ? (
          // Show UP avatar if available
          <div className="relative" style={{ width: `${(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}px`, height: `${(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}px` }}>
            <Image 
              src={upMetadata.avatar} 
              fill
              alt={upMetadata.name || "UP Avatar"}
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          // Otherwise use Blockie or ENS avatar
          <BlockieAvatar
            address={checkSumAddress}
            ensImage={ensAvatar}
            size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
          />
        )}
      </div>
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal ${isUniversalProfile ? "text-pink-500" : ""}`}>{displayAddress}</span>
      ) : targetNetwork.id === hardhat.id ? (
        <span className={`ml-1.5 text-${size} font-normal ${isUniversalProfile ? "text-pink-500" : ""}`}>
          <Link href={blockExplorerAddressLink}>{displayAddress}</Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal ${isUniversalProfile ? "text-pink-500" : ""}`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      )}
      {addressCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      ) : (
        <CopyToClipboard
          text={checkSumAddress}
          onCopy={() => {
            setAddressCopied(true);
            setTimeout(() => {
              setAddressCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </div>
  );
};
