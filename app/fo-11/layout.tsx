import { Fo11LayoutClient } from "./fo-11-layout-client";

export default function Fo11Layout({ children }: { children: React.ReactNode }) {
  return <Fo11LayoutClient>{children}</Fo11LayoutClient>;
}
