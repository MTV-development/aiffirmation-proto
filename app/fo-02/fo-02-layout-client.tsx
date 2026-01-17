'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo02LayoutClient({ children }: { children: React.ReactNode }) {
  const fo02Node = navTree.find((x) => x.href === '/fo-02');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo02Node?.children ?? []} actions={fo02Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
