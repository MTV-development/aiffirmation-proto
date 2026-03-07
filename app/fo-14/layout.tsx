import { Fo14LayoutClient } from "./fo-14-layout-client";

export default function Fo14Layout({ children }: { children: React.ReactNode }) {
  return <Fo14LayoutClient>{children}</Fo14LayoutClient>;
}
