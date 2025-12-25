import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export default function ChatSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const csNode = navTree.find((n) => n.label === 'CS-01');

  return (
    <div className="flex flex-col h-full">
      <TopSubmenu
        items={csNode?.children ?? []}
        actions={csNode?.actions}
      />
      {children}
    </div>
  );
}
