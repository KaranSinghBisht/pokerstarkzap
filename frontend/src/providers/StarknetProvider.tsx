"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { AccountInterface } from "starknet";
import Controller from "@cartridge/controller";

interface StarknetContextType {
  address: string | null;
  account: AccountInterface | null;
  isConnected: boolean;
  connecting: boolean;
  username: string | null;
  error: string | null;
  connectController: () => Promise<void>;
  disconnect: () => void;
}

const StarknetContext = createContext<StarknetContextType>({
  address: null,
  account: null,
  isConnected: false,
  connecting: false,
  username: null,
  error: null,
  connectController: async () => {},
  disconnect: () => {},
});

export function useStarknet() {
  return useContext(StarknetContext);
}

// Initialize controller (singleton)
let controllerInstance: Controller | null = null;

function getController(): Controller {
  if (!controllerInstance) {
    controllerInstance = new Controller({
      policies: { contracts: {} },
    });
  }
  return controllerInstance;
}

export function StarknetProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accountRef = useRef<AccountInterface | null>(null);
  const starkZapWalletRef = useRef<{ disconnect: () => Promise<void> } | null>(null);

  const connectController = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      // Route through StarkZap for deeper SDK integration
      const { getStarkZap } = await import("@/lib/starkzap");
      const { OnboardStrategy } = await import("starkzap");
      const { toAccountInterface } = await import("@/lib/starkzap/adapter");

      const sdk = getStarkZap();
      const { wallet } = await sdk.onboard({
        strategy: OnboardStrategy.Cartridge,
        cartridge: { policies: [] },
      });

      const adapted = toAccountInterface(wallet);
      accountRef.current = adapted;
      starkZapWalletRef.current = wallet;
      setAddress(wallet.address.toString());

      try {
        const cartridgeWallet = wallet as unknown as { username?: () => Promise<string | undefined> };
        if (typeof cartridgeWallet.username === "function") {
          const name = await cartridgeWallet.username();
          if (name) setUsername(name);
        }
      } catch {
        // Username fetch is optional
      }
    } catch {
      // Fallback to direct Controller if StarkZap Cartridge strategy fails
      try {
        const controller = getController();
        const account = await controller.connect();
        if (account) {
          accountRef.current = account as unknown as AccountInterface;
          setAddress(account.address);
          try {
            const name = await controller.username();
            if (name) setUsername(name);
          } catch {
            // Username fetch is optional
          }
        } else {
          setError("Cartridge Controller connection was cancelled.");
        }
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Cartridge connection failed.");
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (starkZapWalletRef.current) {
        await starkZapWalletRef.current.disconnect().catch(() => {});
        starkZapWalletRef.current = null;
      } else {
        const controller = getController();
        await controller.disconnect();
      }
      setAddress(null);
      setUsername(null);
      setError(null);
      accountRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet disconnect failed.");
    }
  }, []);

  return (
    <StarknetContext.Provider
      value={{
        address,
        account: accountRef.current,
        isConnected: !!address,
        connecting,
        username,
        error,
        connectController,
        disconnect,
      }}
    >
      {children}
    </StarknetContext.Provider>
  );
}
