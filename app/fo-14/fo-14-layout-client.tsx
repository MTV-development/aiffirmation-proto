'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';
import { ImplementationProvider, ImplementationSelector } from '@/src/fo-14';

export function Fo14LayoutClient({ children }: { children: React.ReactNode }) {
  const fo14Node = navTree.find((x) => x.href === '/fo-14');

  const implementationDropdown = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Implementation:</span>
      <ImplementationSelector />
    </div>
  );

  return (
    <ImplementationProvider>
      <div className="flex-1 flex flex-col">
        <TopSubmenu
          items={fo14Node?.children ?? []}
          actions={fo14Node?.actions}
          rightContent={implementationDropdown}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ImplementationProvider>
  );
}
