// Type declarations for Web3Modal custom elements used in TSX
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-onramp": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: "sm" | "md" | "lg";
        asset?: string; // e.g., 'ETH' | 'USDC'
        "fiat-currency"?: string; // e.g., 'USD'
        amount?: string | number;
        "chain-id"?: string | number;
      };
      "w3m-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: "sm" | "md" | "lg";
        balance?: "hide" | "show";
      };
    }
  }
}
