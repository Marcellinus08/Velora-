// app/layout.tsx
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
