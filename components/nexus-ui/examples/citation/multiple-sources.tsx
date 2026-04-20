"use client";

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

type Source = {
  url: string;
  title: string;
  description: string;
};

const GROUP_A: Source[] = [
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
    url: "https://dabafinance.com/en/insights/top-10-largest-african-economies-by-gdp-in-2026",
    title: "Top 10 Largest African Economies by GDP in 2026",
    description:
      "When discussing African economies its easy to confuse which countries are growing fastest with which economies are actually largest These are two very different measurements and both mat...",
  },
];

const GROUP_B: Source[] = [
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/flex",
    title: "flex",
    description:
      "The flex CSS shorthand property sets how a flex item will grow or shrink to fit the space available in its flex container.",
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article",
    title: "<article>: The Article Contents element",
    description:
      "The <article> HTML element represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable.",
  },
];

const GROUP_C: Source[] = [
  {
    url: "https://github.com/vercel/ai",
    title: "Vercel AI SDK",
    description:
      "The AI Toolkit for TypeScript. From the creators of Next.js, the AI SDK is a free open-source library for building AI-powered applications.",
  },
  {
    url: "https://github.com/openai/openai-node",
    title: "openai-node",
    description:
      "Official JavaScript / TypeScript library for the OpenAI API. It runs on Node.js and the web.",
  },
  {
    url: "https://github.com/anthropics/anthropic-sdk-typescript",
    title: "anthropic-sdk-typescript",
    description:
      "A TypeScript library providing convenient access to the Anthropic REST API.",
  },
];

const GROUP_D: Source[] = [
  {
    url: "https://news.ycombinator.com/",
    title: "Hacker News",
    description:
      "Hacker News is a social news website focusing on computer science and entrepreneurship.",
  },
  {
    url: "https://www.reuters.com/",
    title: "Reuters",
    description:
      "Reuters is a global news agency providing business, financial, and international news.",
  },
  {
    url: "https://www.bbc.com/news",
    title: "BBC News",
    description:
      "BBC News provides breaking news, video, and analysis from the UK and around the world.",
  },
];

const BUNDLES = [GROUP_A, GROUP_B, GROUP_C, GROUP_D];

function MultiSourceCitation({ items }: { items: Source[] }) {
  return (
    <Citation citations={items}>
      <CitationTrigger />

      <CitationContent>
        <CitationCarousel className="flex w-full flex-col">
          <CitationCarouselHeader>
            <CitationSourcesBadge />

            <CitationCarouselPagination>
              <CitationCarouselPrev />
              <CitationCarouselIndex />
              <CitationCarouselNext />
            </CitationCarouselPagination>
          </CitationCarouselHeader>

          <CitationCarouselContent>
            {items.map((_, index) => (
              <CitationCarouselItem key={items[index].url} index={index}>
                <CitationItem />
              </CitationCarouselItem>
            ))}
          </CitationCarouselContent>
        </CitationCarousel>
      </CitationContent>
    </Citation>
  );
}

function CitationMultipleSources() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BUNDLES.map((items) => (
        <MultiSourceCitation key={items[0].url} items={items} />
      ))}
    </div>
  );
}

export default CitationMultipleSources;
