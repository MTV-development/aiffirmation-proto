import { Fo13LayoutClient } from "./fo-13-layout-client";

export default function Fo13Layout({ children }: { children: React.ReactNode }) {
  return <Fo13LayoutClient>{children}</Fo13LayoutClient>;
}
