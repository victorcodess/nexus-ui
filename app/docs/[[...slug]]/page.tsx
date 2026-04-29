import { getPageImage, source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";
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
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
              className="size-7 rounded-full border-none bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/50"
            >
              <Link
                href={previous.url}
                aria-label={`Previous: ${previous.name}`}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.0} className="size-4 text-gray-500 dark:text-gray-400" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="size-7 rounded-full border-none bg-gray-100 opacity-40 dark:bg-gray-800 dark:opacity-40"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.0} className="size-4 text-gray-400 dark:text-gray-500" />
            </Button>
          )}
          {next ? (
            <Button
              asChild
              className="size-7 rounded-full border-none bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/50"
            >
              <Link href={next.url} aria-label={`Next: ${next.name}`}>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.0} className="size-4 text-gray-500 dark:text-gray-400" />
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="size-7 rounded-full border-none bg-gray-100 opacity-40 dark:bg-gray-800 dark:opacity-40"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.0} className="size-4 text-gray-400 dark:text-gray-500" />
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

  const pageUrl = `${SITE_URL}${page.url}`;

  return {
    title: page.data.title,
    description: page.data.description ?? undefined,
    openGraph: {
      title: page.data.title,
      description: page.data.description ?? undefined,
      url: pageUrl,
      images: [{ url: getPageImage(page).url }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description ?? undefined,
      images: [getPageImage(page).url],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      llms: `${SITE_URL}/llms.txt`,
    },
  };
}
