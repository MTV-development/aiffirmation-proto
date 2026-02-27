'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';
import { ImplementationProvider, ImplementationSelector } from '@/src/fo-13';

export function Fo13LayoutClient({ children }: { children: React.ReactNode }) {
  const fo13Node = navTree.find((x) => x.href === '/fo-13');

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
          items={fo13Node?.children ?? []}
          actions={fo13Node?.actions}
          rightContent={implementationDropdown}
        />
        <main className="flex-1">{children}</main>
      </div>
    </ImplementationProvider>
  );
}
