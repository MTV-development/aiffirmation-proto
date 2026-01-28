'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo07LayoutClient({ children }: { children: React.ReactNode }) {
  const fo07Node = navTree.find((x) => x.href === '/fo-07');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo07Node?.children ?? []} actions={fo07Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
