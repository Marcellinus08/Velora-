import "./globals.css";
import "sweetalert2/dist/sweetalert2.min.css";

import type { Metadata } from "next";
import Header from "@/components/header";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Velora",
  description: "Platform video dengan poin & tugas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className="relative flex min-h-screen size-full flex-col overflow-x-hidden bg-neutral-900"
        style={{ fontFamily: `"Be Vietnam Pro", "Noto Sans", sans-serif` }}
      >
        <NextAbstractWalletProvider>
          <Header />
          {children}
          <Toaster />
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
