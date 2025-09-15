import "./globals.css";
import Header from "@/components/header";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
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
          <TooltipProvider delayDuration={150}>
            <Header />
            {children}
          </TooltipProvider>
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
