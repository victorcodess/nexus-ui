import { source, getNavItems } from "@/lib/source";
import { DocsLayout } from "@/components/layout/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Navbar } from "@/components/navbar";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const navItems = getNavItems();

  return (
    <AISearch>
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        nav={{ ...baseOptions().nav, component: <Navbar navItems={navItems} /> }}
      >
        <AISearchPanel />
        <AISearchTrigger position="float" />
        {children}
      </DocsLayout>
    </AISearch>
  );
}
