'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo10LayoutClient({ children }: { children: React.ReactNode }) {
  const fo10Node = navTree.find((x) => x.href === '/fo-10');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={fo10Node?.children ?? []}
        actions={fo10Node?.actions}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
