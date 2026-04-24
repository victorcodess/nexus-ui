"use client";

import * as React from "react";
import {
  Citation,
  CitationCarousel,
  CitationCarouselContent,
  CitationCarouselHeader,
  CitationCarouselIndex,
  CitationCarouselItem,
  CitationCarouselNext,
  CitationCarouselPagination,
  CitationCarouselPrev,
  CitationContent,
  CitationItem,
  CitationSourcesBadge,
  CitationTrigger,
} from "@/components/nexus-ui/citation";

const INLINE_CITATION_GROUP_REGEX = /((?:\[\d+\])+)/g;
const INLINE_CITATION_ID_REGEX = /\[(\d+)\]/g;
export const INLINE_CITATION_URL_PREFIX = "https://citations.nexus.local/";

export type InlineCitationSource = {
  url: string;
  title?: string;
};

export function withInlineCitationLinks(text: string) {
  return text.replace(INLINE_CITATION_GROUP_REGEX, (match) => {
    const ids = [...match.matchAll(INLINE_CITATION_ID_REGEX)]
      .map(([, id]) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (ids.length === 0) return match;

    const label = ids.map((id) => `[${id}]`).join("");
    return `[${label}](${INLINE_CITATION_URL_PREFIX}${ids.join(",")})`;
  });
}

export function parseCitationIdsFromHref(href: string) {
  if (!href.startsWith(INLINE_CITATION_URL_PREFIX)) return [];
  return href
    .slice(INLINE_CITATION_URL_PREFIX.length)
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

export function citationSourcesFromIds(
  ids: number[],
  sourceUrls: InlineCitationSource[],
) {
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds
    .map((id) => sourceUrls[id - 1])
    .filter((source): source is InlineCitationSource => Boolean(source))
    .map((source) => ({
      url: source.url,
      title: source.title?.trim() || source.url,
    }));
}

export function createInlineCitationComponents(
  sourceUrls: InlineCitationSource[],
) {
  return {
    a: ({ href, children, ...props }: any) => {
      if (typeof href !== "string") {
        return React.createElement("a", { ...props, href } as any, children);
      }

      const ids = parseCitationIdsFromHref(href);
      if (ids.length === 0) {
        return React.createElement("a", { ...props, href } as any, children);
      }

      const citations = citationSourcesFromIds(ids, sourceUrls);
      if (citations.length === 0) {
        return <>{children}</>;
      }

      return (
        <>
          {" "}
          <Citation citations={citations}>
            <CitationTrigger />
            <CitationContent>
              {citations.length > 1 ? (
                <CitationCarousel>
                  <CitationCarouselHeader>
                    <CitationSourcesBadge />

                    <CitationCarouselPagination>
                      <CitationCarouselPrev />
                      <CitationCarouselIndex />
                      <CitationCarouselNext />
                    </CitationCarouselPagination>
                  </CitationCarouselHeader>

                  <CitationCarouselContent>
                    {citations.map((citation, index) => (
                      <CitationCarouselItem key={citation.url} index={index}>
                        <CitationItem />
                      </CitationCarouselItem>
                    ))}
                  </CitationCarouselContent>
                </CitationCarousel>
              ) : (
                <CitationItem />
              )}
            </CitationContent>
          </Citation>
        </>
      );
    },
  };
}

export function getInlineCitationMarkdown(
  text: string,
  sourceUrls: InlineCitationSource[],
) {
  return {
    markdownText: withInlineCitationLinks(text),
    components: createInlineCitationComponents(sourceUrls),
  };
}
