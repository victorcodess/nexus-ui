"use client";

import {
  Citation,
  CitationContent,
  CitationItem,
  CitationTrigger,
} from "@/components/nexus-ui/citation";

const SOURCES = [
  {
    url: "https://en.wikipedia.org/wiki/List_of_African_countries_by_area",
    title: "List of African countries by area",
    description:
      "Africa is the second-largest continent in the world by area and population. Algeria has been the largest country in Africa and the Arab world since the division ...Read more",
  },
  {
    url: "https://www.worldometers.info/population/countries-in-africa-by-population/",
    title: "African Countries by Population (2026)",
    description:
      "List of countries (or dependencies) in Africa ranked by population, from the most populated. Growth rate, median age, fertility rate, area, density, population density, urbanization, urban population, share of world population.",
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/flex",
    title: "flex",
    description:
      "The flex CSS shorthand property sets how a flex item will grow or shrink to fit the space available in its flex container.",
  },
  {
    url: "https://github.com/vercel/ai",
    title: "Vercel AI SDK",
    description:
      "The AI Toolkit for TypeScript. From the creators of Next.js, the AI SDK is a free open-source library for building AI-powered applications.",
  },
] as const;

function SingleCitation({
  source,
}: {
  source: (typeof SOURCES)[number];
}) {
  return (
    <Citation citations={[source]}>
      <CitationTrigger />

      <CitationContent>
        <CitationItem />
      </CitationContent>
    </Citation>
  );
}

function CitationDefault() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SOURCES.map((source) => (
        <SingleCitation key={source.url} source={source} />
      ))}
    </div>
  );
}

export default CitationDefault;
