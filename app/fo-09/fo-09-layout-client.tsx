'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo09LayoutClient({ children }: { children: React.ReactNode }) {
  const fo09Node = navTree.find((x) => x.href === '/fo-09');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo09Node?.children ?? []} actions={fo09Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
