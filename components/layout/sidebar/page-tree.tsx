import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { type FC, Fragment, type ReactNode, createContext, use, useMemo } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import type * as Base from './base';
import { usePathname } from 'fumadocs-core/framework';
import { isActive } from '../../../lib/urls';

export interface SidebarPageTreeComponents {
  Item: FC<{ item: PageTree.Item }>;
  Folder: FC<{ item: PageTree.Folder; children: ReactNode }>;
  Separator: FC<{ item: PageTree.Separator }>;
}

const RendererContext = createContext<
  | (Partial<SidebarPageTreeComponents> & {
      pathname: string;
    })
  | null
>(null);

type InternalComponents = Pick<
  typeof Base,
  | 'SidebarSeparator'
  | 'SidebarFolder'
  | 'SidebarFolderLink'
  | 'SidebarFolderContent'
  | 'SidebarFolderTrigger'
  | 'SidebarItem'
>;

export function createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarSeparator,
  SidebarItem,
}: InternalComponents) {
  function renderList(nodes: PageTree.Node[]) {
    const groups: { separator: PageTree.Node | null; items: PageTree.Node[] }[] = [];
    let current: { separator: PageTree.Node | null; items: PageTree.Node[] } = { separator: null, items: [] };

    for (const node of nodes) {
      if (node.type === 'separator') {
        if (current.separator || current.items.length > 0) {
          groups.push(current);
        }
        current = { separator: node, items: [] };
      } else {
        current.items.push(node);
      }
    }
    if (current.separator || current.items.length > 0) {
      groups.push(current);
    }

    return groups.map((group, gi) => (
      <Fragment key={gi}>
        {group.separator && <PageTreeNode node={group.separator} />}
        <div className="flex flex-col gap-1">
          {group.items.map((node, i) => (
            <PageTreeNode key={i} node={node} />
          ))}
        </div>
      </Fragment>
    ));
  }

  function PageTreeNode({ node }: { node: PageTree.Node }) {
    const { Separator, Item, Folder, pathname } = use(RendererContext)!;

    if (node.type === 'separator') {
      if (Separator) return <Separator item={node} />;
      return (
        <SidebarSeparator>
          {node.icon}
          {node.name}
        </SidebarSeparator>
      );
    }

    if (node.type === 'folder') {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- assume node type unchanged
      const path = useTreePath();
      if (Folder) return <Folder item={node}>{renderList(node.children)}</Folder>;

      return (
        <SidebarFolder
          collapsible={node.collapsible}
          active={path.includes(node)}
          defaultOpen={node.defaultOpen}
        >
          {node.index ? (
            <SidebarFolderLink
              href={node.index.url}
              active={isActive(node.index.url, pathname)}
              external={node.index.external}
            >
              {node.icon}
              {node.name}
            </SidebarFolderLink>
          ) : (
            <SidebarFolderTrigger>
              {node.icon}
              {node.name}
            </SidebarFolderTrigger>
          )}
          <SidebarFolderContent>{renderList(node.children)}</SidebarFolderContent>
        </SidebarFolder>
      );
    }

    if (Item) return <Item item={node} />;
    return (
      <SidebarItem
        href={node.url}
        external={node.external}
        active={isActive(node.url, pathname)}
        icon={node.icon}
      >
        {node.name}
      </SidebarItem>
    );
  }

  /**
   * Render sidebar items from page tree
   */
  return function SidebarPageTree(components: Partial<SidebarPageTreeComponents>) {
    const { Folder, Item, Separator } = components;
    const { root } = useTreeContext();
    const pathname = usePathname();

    return (
      <RendererContext
        value={useMemo(
          () => ({ Folder, Item, Separator, pathname }),
          [Folder, Item, Separator, pathname],
        )}
      >
        <Fragment key={root.$id}>{renderList(root.children)}</Fragment>
      </RendererContext>
    );
  };
}
