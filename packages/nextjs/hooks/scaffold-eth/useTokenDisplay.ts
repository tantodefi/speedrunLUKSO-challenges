import { useMemo } from "react";

/**
 * Hook for normalizing token IDs and array displays for various token standards
 * Helps ensure consistent display between ERC721, ERC1155, LSP7, LSP8 tokens
 */
export const useTokenDisplay = () => {
  const normalizeTokenIds = useMemo(() => {
    return (tokenIds: unknown): unknown => {
      // Handle null/undefined
      if (tokenIds === null || tokenIds === undefined) {
        return tokenIds;
      }
      
      // Handle arrays of token IDs
      if (Array.isArray(tokenIds)) {
        // Check if it's an array of strings that are quoted numbers
        // This is a common serialization pattern with LSP8 tokens
        const isQuotedNumbers = tokenIds.every(item => 
          typeof item === 'string' && 
          item.startsWith('"') && 
          item.endsWith('"') && 
          !isNaN(Number(item.replace(/"/g, '')))
        );
        
        if (isQuotedNumbers) {
          // Convert to a simple number array as is common with ERC721 tokens
          return tokenIds.map(item => {
            if (typeof item === 'string') {
              return Number(item.replace(/"/g, ''));
            }
            return item;
          });
        }
        
        // Check if array contains string hex values common in LSP8
        const isLSP8HexFormat = tokenIds.every(item => 
          typeof item === 'string' && 
          item.startsWith('0x')
        );
        
        if (isLSP8HexFormat) {
          // Try to convert hex bytes32 to simple numbers where possible
          return tokenIds.map(item => {
            if (typeof item === 'string' && item.startsWith('0x')) {
              try {
                // Remove leading zeros and convert to decimal
                const cleaned = item.replace(/^0x0+/, '0x');
                const num = BigInt(cleaned);
                
                // Only convert to number if it's a reasonable integer size
                if (num <= BigInt(Number.MAX_SAFE_INTEGER)) {
                  return Number(num);
                }
              } catch (e) {
                // If conversion fails, return original
              }
            }
            return item;
          });
        }
      }
      
      return tokenIds;
    };
  }, []);

  return { normalizeTokenIds };
}; 