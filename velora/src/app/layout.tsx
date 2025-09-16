// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/header";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProfileUpsertOnLogin from "@/components/auth/profile-upsert-on-login";

export const metadata = {
  title: "Velora",
  description: "Platform video dengan poin & tugas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className="relative flex min-h-screen flex-col overflow-x-hidden bg-neutral-900"
        style={{ fontFamily: `"Be Vietnam Pro", "Noto Sans", sans-serif` }}
      >
        <NextAbstractWalletProvider>
          {/* Komponen pemicu di sini agar hook ada dalam konteks wagmi */}
          <ProfileUpsertOnLogin />

          <TooltipProvider delayDuration={150}>
            <Header />
            {children}
          </TooltipProvider>
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
