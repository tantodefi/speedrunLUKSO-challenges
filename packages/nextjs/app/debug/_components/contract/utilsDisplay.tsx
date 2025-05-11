import { ReactElement } from "react";
import { TransactionBase, TransactionReceipt, formatEther, isAddress } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

// Helper to clean up token IDs in LSP8 format
const cleanTokenIds = (displayContent: DisplayContent | DisplayContent[]) => {
  if (Array.isArray(displayContent)) {
    // Check if this is an array of quoted strings that look like token IDs
    const isQuotedTokenIds = displayContent.every(item => 
      typeof item === 'string' && 
      (item.startsWith('"') && item.endsWith('"')) && 
      !isNaN(Number(item.replace(/"/g, '')))
    );

    if (isQuotedTokenIds) {
      // For token IDs, remove quotes and return as simple numbers
      return displayContent.map(item => {
        if (typeof item === 'string') {
          return Number(item.replace(/"/g, ''));
        }
        return item;
      });
    }

    // Also handle hex string token IDs common in LSP8
    const isHexTokenIds = displayContent.every(item => 
      typeof item === 'string' && 
      item.startsWith('0x')
    );

    if (isHexTokenIds) {
      // Try to convert hex values to numbers if they represent small integers
      return displayContent.map(item => {
        if (typeof item === 'string' && item.startsWith('0x')) {
          try {
            // If it's a bytes32 with leading zeros, trim them
            const trimmedHex = item.replace(/^0x0+/, '0x');
            const num = BigInt(trimmedHex);
            // Only convert if it's a reasonably small number
            if (num <= BigInt(Number.MAX_SAFE_INTEGER)) {
              return Number(num);
            }
          } catch (e) {
            // If conversion fails, keep original
          }
        }
        return item;
      });
    }
  }
  return displayContent;
};

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  asText = false,
): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  if (typeof displayContent === "bigint") {
    try {
      const asNumber = Number(displayContent);
      if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
        return asNumber;
      } else {
        return "LYX " + formatEther(displayContent);
      }
    } catch (e) {
      return "LYX " + formatEther(displayContent);
    }
  }

  if (typeof displayContent === "string" && isAddress(displayContent)) {
    return asText ? displayContent : <Address address={displayContent} />;
  }

  if (Array.isArray(displayContent)) {
    // Clean up token IDs if needed
    const cleanedContent = cleanTokenIds(displayContent);
    
    const mostReadable = (v: DisplayContent) =>
      ["number", "boolean"].includes(typeof v) ? v : displayTxResultAsText(v);
    const displayable = JSON.stringify(
      Array.isArray(cleanedContent) ? cleanedContent.map(mostReadable) : displayContent.map(mostReadable), 
      replacer
    );

    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }

  return JSON.stringify(displayContent, replacer, 2);
};

const displayTxResultAsText = (displayContent: DisplayContent) => displayTxResult(displayContent, true);
