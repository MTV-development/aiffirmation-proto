import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectsNode = navTree.find((x) => x.href === "/projects");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={projectsNode?.children ?? []}
        actions={projectsNode?.actions}
      />
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
