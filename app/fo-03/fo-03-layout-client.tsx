'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo03LayoutClient({ children }: { children: React.ReactNode }) {
  const fo03Node = navTree.find((x) => x.href === '/fo-03');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo03Node?.children ?? []} actions={fo03Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
