import { Fo12LayoutClient } from "./fo-12-layout-client";

export default function Fo12Layout({ children }: { children: React.ReactNode }) {
  return <Fo12LayoutClient>{children}</Fo12LayoutClient>;
}
