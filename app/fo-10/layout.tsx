import { Fo10LayoutClient } from "./fo-10-layout-client";

export default function Fo10Layout({ children }: { children: React.ReactNode }) {
  return <Fo10LayoutClient>{children}</Fo10LayoutClient>;
}
