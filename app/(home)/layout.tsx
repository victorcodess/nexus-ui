import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Navbar } from '@/components/navbar';
import { getNavItems } from '@/lib/source';

export default function Layout({ children }: LayoutProps<'/'>) {
  const navItems = getNavItems();

  return (
    <HomeLayout
      {...baseOptions()}
      nav={{ ...baseOptions().nav, component: <Navbar navItems={navItems} /> }}
    >
      {children}
    </HomeLayout>
  );
}
