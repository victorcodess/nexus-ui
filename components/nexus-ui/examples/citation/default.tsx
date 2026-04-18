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
  CitationDescription,
  CitationItem,
  CitationSiteName,
  CitationSource,
  CitationTitle,
  CitationTrigger,
  CitationFaviconGroup,
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
    url: "https://dabafinance.com/en/insights/top-10-largest-african-economies-by-gdp-in-2026",
    title: "Top 10 Largest African Economies by GDP in 2026",
    description:
      "When discussing African economies its easy to confuse which countries are growing fastest with which economies are actually largest These are two very different measurements and both mat...",
  },
] as const;

function CitationDefault() {
  return (
    <div className="flex items-center gap-5">
      <Citation citations={[...SOURCES]}>
        <CitationTrigger />

        <CitationContent>
          <CitationCarousel className="flex w-full flex-col">
            <CitationCarouselHeader>
              <CitationSource className="mt-0 h-6.5 rounded-full bg-secondary pr-1.5 pl-1">
                <CitationFaviconGroup />
                <CitationSiteName>{SOURCES.length} sources</CitationSiteName>
              </CitationSource>

              <CitationCarouselPagination>
                <CitationCarouselPrev />
                <CitationCarouselIndex />
                <CitationCarouselNext />
              </CitationCarouselPagination>
            </CitationCarouselHeader>

            <CitationCarouselContent>
              {SOURCES.map((_, index) => (
                <CitationCarouselItem key={SOURCES[index].url} index={index}>
                  <CitationItem>
                    <CitationTitle />
                    <CitationDescription />
                    <CitationSource />
                  </CitationItem>
                </CitationCarouselItem>
              ))}
            </CitationCarouselContent>
          </CitationCarousel>
        </CitationContent>
      </Citation>

      <Citation citations={[...SOURCES.slice(2, 3)]}>
        <CitationTrigger />

        <CitationContent>
          <CitationItem>
            <CitationTitle />
            <CitationDescription />
            <CitationSource />
          </CitationItem>
        </CitationContent>
      </Citation>
    </div>
  );
}

export default CitationDefault;
