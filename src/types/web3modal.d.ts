// Type declarations for Web3Modal custom elements used in TSX
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-onramp": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: "sm" | "md" | "lg";
      };
      "w3m-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: "sm" | "md" | "lg";
        balance?: "hide" | "show";
      };
    }
  }
}
