'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo08LayoutClient({ children }: { children: React.ReactNode }) {
  const fo08Node = navTree.find((x) => x.href === '/fo-08');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo08Node?.children ?? []} actions={fo08Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
