'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo06LayoutClient({ children }: { children: React.ReactNode }) {
  const fo06Node = navTree.find((x) => x.href === '/fo-06');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo06Node?.children ?? []} actions={fo06Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
