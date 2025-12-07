import type { ReactNode } from "react";

export const metadata = {
  title: "Admin Panel - Glonic",
  description: "Admin management dashboard for Glonic platform",
};

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
