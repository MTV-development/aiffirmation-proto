import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsNode = navTree.find((x) => x.href === "/settings");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={settingsNode?.children ?? []}
        actions={settingsNode?.actions}
      />
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
