// src/app/layout.tsx
import "./globals.css";
import SiteHeader from "@/components/header/index";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProfileUpsertOnLogin from "@/components/auth/profile-upsert-on-login";
import { ToastContainer } from "@/components/ui/toast";
import type { ReactNode } from "react";

export const metadata = {
  title: "Glonic",
  description: "Platform video dengan poin & tugas",
   icons: {
    icon: [{ url: "/glonic_logo_main.png", type: "image/png" }],
  },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="overflow-visible">
      <head>
        {/* Material Icons Round (ligature-based) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        {/* CSS helper untuk memastikan ligature aktif & mengalahkan preflight */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
  __html: `
    .material-icons-round {
        font-family: 'Material Icons Round' !important;
        font-weight: normal !important;
        font-style: normal !important;
        display: inline-block;
        line-height: 1;
        text-transform: none !important;
        letter-spacing: normal !important;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-feature-settings: 'liga';
        font-feature-settings: 'liga';
        font-size: !important; /* Menetapkan ukuran default */
      }
  `,
}}
        />
      </head>
      <body
        className="relative flex min-h-screen flex-col overflow-visible bg-neutral-900 pt-[57px] pb-0 md:pb-0"
        style={{ fontFamily: `"Be Vietnam Pro", "Noto Sans", sans-serif` }}
      >
        <NextAbstractWalletProvider>
          {/* Komponen pemicu di sini agar hook ada dalam konteks wagmi */}
          <ProfileUpsertOnLogin />

          <TooltipProvider delayDuration={150}>
            <SiteHeader />
            {children}
          </TooltipProvider>
          
          {/* Toast notifications */}
          <ToastContainer />
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
