import * as React from "react";
import {
  AiBrain01Icon,
  AiWebBrowsingIcon,
  CheckmarkCircle01Icon,
  Globe02Icon,
  MapsIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepContent,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";

const WEB_SEARCH_QUERIES = [
  "3 days in lisbon best neighborhoods",
  "must-visit places in lisbon for first timers",
  "lisbon public transport tips 2026",
  "best sunset viewpoints lisbon",
  "food spots alfama bairro alto chiado",
];

const WEB_SOURCES = [
  {
    title: "Lisbon neighborhoods guide for first-time visitors",
    domain: "visitlisboa.com",
    url: "https://www.visitlisboa.com/en/",
  },
  {
    title: "48 hours and 72 hours in Lisbon itinerary",
    domain: "lonelyplanet.com",
    url: "https://www.lonelyplanet.com/portugal/lisbon",
  },
  {
    title: "Best miradouros (viewpoints) in Lisbon",
    domain: "culturetrip.com",
    url: "https://theculturetrip.com/europe/portugal/lisbon",
  },
  {
    title: "Lisbon metro and tram guide",
    domain: "carris.pt",
    url: "https://www.carris.pt/en/",
  },
];

const WEATHER_CARDS = [
  {
    day: "Fri",
    condition: "Sunny",
    high: "24C",
    low: "16C",
    rainChance: "5%",
  },
  {
    day: "Sat",
    condition: "Partly cloudy",
    high: "23C",
    low: "15C",
    rainChance: "15%",
  },
  {
    day: "Sun",
    condition: "Breezy",
    high: "21C",
    low: "14C",
    rainChance: "20%",
  },
];

const MAP_ROUTES = [
  { from: "Hotel -> Belem Tower", eta: "24 min", mode: "Tram + walk" },
  { from: "Alfama -> Time Out Market", eta: "18 min", mode: "Metro + walk" },
  { from: "Chiado -> Miradouro da Senhora", eta: "22 min", mode: "Taxi" },
];

function ChainOfThoughtWithContent() {
  return (
    <div className="w-full">
      <ChainOfThought autoCloseOnAllComplete={false}>
        <ChainOfThoughtTrigger
          icon={
            <HugeiconsIcon
              icon={AiBrain01Icon}
              strokeWidth={1.75}
              className="size-4"
            />
          }
        >
          Planned a 3-day Lisbon itinerary
        </ChainOfThoughtTrigger>

        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            status="completed"
            hasContent
            autoCloseOnComplete={false}
          >
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={AiWebBrowsingIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Web search
            </ChainOfThoughtStepTitle>

            <ChainOfThoughtStepContent>
              <div className="mt-1 space-y-2">
                <div className="-mx-1 mt-1 no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
                  {WEB_SEARCH_QUERIES.map((query) => (
                    <span
                      key={query}
                      className="inline-flex h-6.5 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-xs leading-4.5 whitespace-nowrap text-muted-foreground sm:max-w-[187.8px] sm:whitespace-normal"
                    >
                      <HugeiconsIcon
                        icon={Globe02Icon}
                        strokeWidth={1.75}
                        className="size-4 shrink-0 text-muted-foreground/50"
                      />
                      <span className="min-w-0 sm:truncate">{query}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-1.5 no-scrollbar flex max-h-[180px] w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-[12px] border border-border/50 bg-secondary p-3">
                  {WEB_SOURCES.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(0,7.5rem)] items-center gap-2 rounded-md px-1.5 py-1 text-xs leading-4.5 transition-colors hover:bg-border/50 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,9rem)] dark:hover:bg-border/40"
                    >
                      <img
                        alt=""
                        loading="lazy"
                        width={16}
                        height={16}
                        className="size-4 shrink-0 rounded"
                        src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`}
                      />
                      <div className="min-w-0 truncate text-primary">
                        {source.title}
                      </div>
                      <div
                        className="min-w-0 truncate text-right text-muted-foreground tabular-nums"
                        title={source.domain}
                      >
                        {source.domain}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </ChainOfThoughtStepContent>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep
            status="completed"
            hasContent
            autoCloseOnComplete={false}
          >
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={Sun03Icon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Get weather tool
            </ChainOfThoughtStepTitle>

            <ChainOfThoughtStepContent>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {WEATHER_CARDS.map((item) => (
                  <div
                    key={item.day}
                    className="rounded-[12px] border border-border/50 bg-secondary p-3"
                  >
                    <div className="text-xs text-muted-foreground">
                      {item.day}
                    </div>
                    <div className="mt-1 text-sm font-medium text-primary">
                      {item.condition}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      H: {item.high} - L: {item.low}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Rain: {item.rainChance}
                    </div>
                  </div>
                ))}
              </div>
            </ChainOfThoughtStepContent>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep
            status="completed"
            hasContent
            autoCloseOnComplete={false}
            className="animate-in"
          >
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={MapsIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Route planner tool
            </ChainOfThoughtStepTitle>

            <ChainOfThoughtStepContent>
              <div className="mt-1.5 no-scrollbar flex max-h-[180px] w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-[12px] border border-border/50 bg-secondary p-3">
                {MAP_ROUTES.map((route) => (
                  <div
                    key={route.from}
                    className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md px-1.5 py-1 text-xs leading-4.5"
                  >
                    <div className="min-w-0 truncate text-primary">
                      {route.from}
                    </div>
                    <div className="text-muted-foreground tabular-nums">
                      {route.eta}
                    </div>
                    <div className="text-muted-foreground">{route.mode}</div>
                  </div>
                ))}
                <div className="mt-1 rounded-md border border-border/50 bg-background/50 px-2 py-1.5 text-xs text-muted-foreground">
                  Suggested pass: 24-hour transit card for day 1 and day 2.
                </div>
              </div>
            </ChainOfThoughtStepContent>
          </ChainOfThoughtStep>

          <ChainOfThoughtComplete
            label="Research complete"
            icon={
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                strokeWidth={1.75}
                className="size-4"
              />
            }
          />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}

export default ChainOfThoughtWithContent;
