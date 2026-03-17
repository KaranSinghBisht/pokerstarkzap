import type { Metadata } from "next";
import { StarknetProvider } from "@/providers/StarknetProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokerZap - Poker on Starknet",
  description: "Play Texas Hold'em poker on Starknet with gasless transactions via StarkZap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="crt-overlay crt-flicker" />
        <div className="relative min-h-screen bg-[var(--bg0)]">
          <div className="relative z-20 min-h-screen">
            <StarknetProvider>
              {children}
            </StarknetProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
