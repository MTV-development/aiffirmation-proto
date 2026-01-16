'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo01LayoutClient({ children }: { children: React.ReactNode }) {
  const fo01Node = navTree.find((x) => x.href === '/fo-01');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo01Node?.children ?? []} actions={fo01Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
