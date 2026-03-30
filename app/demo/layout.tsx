import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Demo",
  robots: { index: true, follow: true },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
