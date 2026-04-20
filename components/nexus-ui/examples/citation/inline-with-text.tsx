"use client";

import {
  Citation,
  CitationContent,
  CitationItem,
  CitationTrigger,
} from "@/components/nexus-ui/citation";

const WORLD_POP = {
  url: "https://www.worldometers.info/population/countries-in-africa-by-population/",
  title: "African Countries by Population (2026)",
  description:
    "List of countries (or dependencies) in Africa ranked by population, from the most populated. Growth rate, median age, fertility rate, area, density, population density, urbanization, urban population, share of world population.",
};

const MDN_FLEX = {
  url: "https://developer.mozilla.org/en-US/docs/Web/CSS/flex",
  title: "flex",
  description:
    "The flex CSS shorthand property sets how a flex item will grow or shrink to fit the space available in its flex container.",
};

const VERCEL_AI = {
  url: "https://github.com/vercel/ai",
  title: "Vercel AI SDK",
  description:
    "The AI Toolkit for TypeScript. From the creators of Next.js, the AI SDK is a free open-source library for building AI-powered applications.",
};

type Source = typeof WORLD_POP;

function InlineCitation({ source }: { source: Source }) {
  return (
    <Citation citations={[source]}>
      <CitationTrigger />
      <CitationContent>
        <CitationItem />
      </CitationContent>
    </Citation>
  );
}

function CitationInlineWithText() {
  return (
    <div className="prose max-w-prose text-sm leading-relaxed text-foreground">
      <p className="mb-4 first:mt-0 last:mb-0">
        Algeria often leads land-area lists for Africa. Headlines still blur the
        two questions when editors rush copy. Population rankings reshuffle the
        order—see the full country table. <InlineCitation source={WORLD_POP} />
      </p>

      <p className="mb-4 last:mb-0">
        Dense dashboards punish vague flex values.{" "}
        <InlineCitation source={MDN_FLEX} /> Tuning a flex row is easier when
        the shorthand is one click away: check before you lock in grow and
        shrink.
      </p>

      <p className="mb-4 last:mb-0">
        Prototype streaming before you polish the UI shell. A tiny route in
        Next.js usually starts with the toolkit README and examples.{" "}
        <InlineCitation source={VERCEL_AI} />
      </p>
    </div>
  );
}

export default CitationInlineWithText;
