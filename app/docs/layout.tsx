import { source } from "@/lib/source";
import { DocsLayout } from "@/components/layout/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Navbar } from "@/components/navbar";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      nav={{ ...baseOptions().nav, component: <Navbar /> }}
    >
      {children}
    </DocsLayout>
  );
}
