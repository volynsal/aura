// Utility to clear stale WalletConnect/AppKit sessions in browser storage
export function resetWalletSessions() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (/^(wc@|walletconnect|WALLETCONNECT|wagmi|walletlink|coinbase)/i.test(k)) {
        keys.push(k);
      }
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
  try {
    // Some providers use sessionStorage too
    const sKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)!;
      if (/^(wc@|walletconnect|WALLETCONNECT|wagmi|walletlink|coinbase)/i.test(k)) {
        sKeys.push(k);
      }
    }
    sKeys.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}
