'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/header/index';
import type { ReactNode } from 'react';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPanel = pathname?.startsWith('/panel-admin');

  return (
    <>
      {!isAdminPanel && <SiteHeader />}
      <div className={!isAdminPanel ? 'pt-[57px]' : ''}>
        {children}
      </div>
    </>
  );
}
