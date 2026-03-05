import { getPageImage, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/layout/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { gitConfig } from "@/lib/layout.shared";
import { Button } from "@/components/ui/button";
import { findNeighbour } from "fumadocs-core/page-tree";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const { previous, next } = findNeighbour(source.pageTree, page.url);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/edit/${gitConfig.branch}/content/docs/${page.path}`}
      markdownUrl={`/llms.mdx/docs/${page.slugs.join("/")}`}
      className="gap-1"
    >
      <div className="flex items-center justify-between">
        <DocsTitle>{page.data.title}</DocsTitle>

        <div className="flex gap-2">
          {previous ? (
            <Button
              asChild
              className="size-7 rounded-full border-none bg-gray-100 hover:bg-gray-200"
            >
              <Link
                href={previous.url}
                aria-label={`Previous: ${previous.name}`}
              >
                <ChevronLeft className="size-4 text-gray-500" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="size-7 rounded-full border-none bg-gray-100 opacity-40"
            >
              <ChevronLeft className="size-4 text-gray-400" />
            </Button>
          )}
          {next ? (
            <Button
              asChild
              className="size-7 rounded-full border-none bg-gray-100 hover:bg-gray-200"
            >
              <Link href={next.url} aria-label={`Next: ${next.name}`}>
                <ChevronRight className="size-4 text-gray-500" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="size-7 rounded-full border-none bg-gray-100 opacity-40"
            >
              <ChevronRight className="size-4 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
