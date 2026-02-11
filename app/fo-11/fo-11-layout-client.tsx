'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo11LayoutClient({ children }: { children: React.ReactNode }) {
  const fo11Node = navTree.find((x) => x.href === '/fo-11');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={fo11Node?.children ?? []}
        actions={fo11Node?.actions}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
