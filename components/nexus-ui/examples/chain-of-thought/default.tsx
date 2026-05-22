import * as React from "react";
import {
  AiBrain01Icon,
  AiWebBrowsingIcon,
  ArrowDown01Icon,
  Globe02Icon,
  CheckmarkCircle01Icon,
  YoutubeIcon,
  IdeaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SEARCH_PILLS = [
  "trending movies April 2026 box office",
  "popular movies April 2026",
  "highest grossing movies April 2026",
  "box office for April 2026",
  "movie releases April 2026",
];

const YOUTUBE_SEARCH_QUERIES = [
  "april 2026 box office explained",
  "top 10 movies april 2026 youtube",
  "weekend box office recap april 2026",
  "april 2026 movie releases trailer roundup",
  "highest grossing movies 2026 so far breakdown",
];

const SOURCES = [
  {
    title: "Domestic Box Office For April 2026 - Box Office Mojo",
    domain: "boxofficemojo.com",
    url: "https://www.boxofficemojo.com/month/april/2026/",
  },
  {
    title:
      "Mario, Michael & Mary Catapult Global Box Office to $2.63bn in April - Screendollars",
    domain: "screendollars.com",
    url: "https://screendollars.com/news/box-office-outlook/mario-michael-mary-catapult-global-box-office-to-2-63bn-in-april/",
  },
  {
    title:
      "'Michael' tops global box office chart with record-breaking opening - Screen Daily",
    domain: "screendaily.com",
    url: "https://www.screendaily.com/news/michael-tops-global-box-office-chart-with-record-breaking-219m-opening/5216014.article",
  },
  {
    title: "Box Office: Zendaya's 'The Drama' Crosses $100M WW",
    domain: "deadline.com",
    url: "https://deadline.com/2026/04/the-drama-box-office-zendaya-robert-pattinson-1236867132/",
  },
  {
    title: "Top Grossing Movies Out Now in Theaters - Rotten Tomatoes",
    domain: "rottentomatoes.com",
    url: "https://www.rottentomatoes.com/browse/movies_in_theaters/sort:top_box_office",
  },
  {
    title: "List of 2026 box office number-one films in the United States",
    domain: "en.wikipedia.org",
    url: "https://en.wikipedia.org/wiki/List_of_2026_box_office_number-one_films_in_the_United_States",
  },
  {
    title: "Domestic Box Office For April 2026 - Box Office Mojo",
    domain: "boxofficemojo.com",
    url: "https://www.boxofficemojo.com/month/april/2026/",
  },
  {
    title:
      "Mario, Michael & Mary Catapult Global Box Office to $2.63bn in April - Screendollars",
    domain: "screendollars.com",
    url: "https://screendollars.com/news/box-office-outlook/mario-michael-mary-catapult-global-box-office-to-2-63bn-in-april/",
  },
  {
    title:
      "'Michael' tops global box office chart with record-breaking opening - Screen Daily",
    domain: "screendaily.com",
    url: "https://www.screendaily.com/news/michael-tops-global-box-office-chart-with-record-breaking-219m-opening/5216014.article",
  },
  {
    title: "Box Office: Zendaya's 'The Drama' Crosses $100M WW",
    domain: "deadline.com",
    url: "https://deadline.com/2026/04/the-drama-box-office-zendaya-robert-pattinson-1236867132/",
  },
  {
    title: "Top Grossing Movies Out Now in Theaters - Rotten Tomatoes",
    domain: "rottentomatoes.com",
    url: "https://www.rottentomatoes.com/browse/movies_in_theaters/sort:top_box_office",
  },
  {
    title: "List of 2026 box office number-one films in the United States",
    domain: "en.wikipedia.org",
    url: "https://en.wikipedia.org/wiki/List_of_2026_box_office_number-one_films_in_the_United_States",
  },
  {
    title: "Domestic Box Office For April 2026 - Box Office Mojo",
    domain: "boxofficemojo.com",
    url: "https://www.boxofficemojo.com/month/april/2026/",
  },
  {
    title:
      "Mario, Michael & Mary Catapult Global Box Office to $2.63bn in April - Screendollars",
    domain: "screendollars.com",
    url: "https://screendollars.com/news/box-office-outlook/mario-michael-mary-catapult-global-box-office-to-2-63bn-in-april/",
  },
  {
    title:
      "'Michael' tops global box office chart with record-breaking opening - Screen Daily",
    domain: "screendaily.com",
    url: "https://www.screendaily.com/news/michael-tops-global-box-office-chart-with-record-breaking-219m-opening/5216014.article",
  },
  {
    title: "Box Office: Zendaya's 'The Drama' Crosses $100M WW",
    domain: "deadline.com",
    url: "https://deadline.com/2026/04/the-drama-box-office-zendaya-robert-pattinson-1236867132/",
  },
  {
    title: "Top Grossing Movies Out Now in Theaters - Rotten Tomatoes",
    domain: "rottentomatoes.com",
    url: "https://www.rottentomatoes.com/browse/movies_in_theaters/sort:top_box_office",
  },
  {
    title: "List of 2026 box office number-one films in the United States",
    domain: "en.wikipedia.org",
    url: "https://en.wikipedia.org/wiki/List_of_2026_box_office_number-one_films_in_the_United_States",
  },
];

const YOUTUBE_LINKS = [
  {
    title: "Top 10 April 2026 Box Office Movies",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=top+movies+april+2026+box+office",
  },
  {
    title: "April 2026 Movie Releases Breakdown",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=april+2026+movie+releases",
  },
  {
    title: "Highest Grossing Movies in 2026 So Far",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=highest+grossing+movies+2026",
  },
  {
    title: "Weekend Box Office Report - April 2026",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=weekend+box+office+april+2026",
  },
  {
    title: "Box Office Analysis and Predictions",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=box+office+analysis+2026",
  },
  {
    title: "Most Anticipated Movies of April 2026",
    domain: "youtube.com",
    url: "https://www.youtube.com/results?search_query=most+anticipated+movies+april+2026",
  },
];

function ChainOfThoughtDefault() {
  return (
    <div className="w-full">
      <Collapsible>
        <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1.25 text-muted-foreground transition-colors hover:text-foreground">
          <HugeiconsIcon
            icon={AiBrain01Icon}
            strokeWidth={1.75}
            className="size-4"
          />
          <span className="text-sm leading-6 group-data-[streaming=true]:shimmer group-data-[streaming=true]:shimmer-repeat-delay-0 group-data-[streaming=true]:shimmer-spread-50 group-data-[streaming=true]:not-dark:shimmer-invert">
            Chain of Thought
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="ml-0.5 size-4 opacity-0 transition-all group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:group-data-[streaming=false]:opacity-100"
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="flex w-full gap-2 text-sm text-muted-foreground">
            <div className="relative mt-0.25">
              <HugeiconsIcon
                icon={YoutubeIcon}
                strokeWidth={1.75}
                className="size-4"
              />
              <div className="absolute top-4.5 -bottom-2.5 left-1/2 -mx-px w-px bg-border"></div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 overflow-x-hidden">
              <Collapsible>
                <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1.25 text-muted-foreground transition-colors hover:text-foreground">
                  <span className="text-sm leading-4.5 group-data-[streaming=true]:shimmer group-data-[streaming=true]:shimmer-repeat-delay-0 group-data-[streaming=true]:shimmer-spread-50 group-data-[streaming=true]:not-dark:shimmer-invert">
                    Youtube search
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className="ml-0.5 size-4 opacity-0 transition-all group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:group-data-[streaming=false]:opacity-100"
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="mt-1 space-y-2">
                    <div className="-mx-1 mt-1 no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
                      {YOUTUBE_SEARCH_QUERIES.map((pill) => (
                        <span
                          key={pill}
                          className="inline-flex h-6.5 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-xs leading-4.5 whitespace-nowrap text-muted-foreground sm:max-w-[187.8px] sm:whitespace-normal"
                        >
                          <HugeiconsIcon
                            icon={Globe02Icon}
                            strokeWidth={1.75}
                            className="size-4 shrink-0 text-muted-foreground/50"
                          />
                          <span className="min-w-0 sm:truncate">{pill}</span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-1.5 no-scrollbar flex max-h-[180px] w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-[12px] border border-border/50 bg-secondary p-3">
                      {YOUTUBE_LINKS.map((source) => (
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div
            className="flex items-center gap-2 text-sm leading-4.5 text-muted-foreground"
            style={{ opacity: 1, transform: "none" }}
          >
            <div className="relative">
              <HugeiconsIcon
                icon={IdeaIcon}
                strokeWidth={1.75}
                className="size-4"
              />
              <div className="absolute top-4.5 -bottom-2.75 left-1/2 -mx-px w-px bg-border"></div>
            </div>
            <span className="">Gathered 8 sources</span>
          </div>

          <div className="flex w-full animate-in gap-2 text-sm text-muted-foreground">
            <div className="relative mt-0.25">
              <HugeiconsIcon
                icon={AiWebBrowsingIcon}
                strokeWidth={1.75}
                className="size-4"
              />
              <div className="absolute top-4.5 -bottom-2.5 left-1/2 -mx-px w-px bg-border"></div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 overflow-x-hidden">
              <Collapsible>
                <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1.25 text-muted-foreground transition-colors hover:text-foreground">
                  <span className="text-sm leading-4.5 group-data-[streaming=true]:shimmer group-data-[streaming=true]:shimmer-repeat-delay-0 group-data-[streaming=true]:shimmer-spread-50 group-data-[streaming=true]:not-dark:shimmer-invert">
                    Web search
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className="ml-0.5 size-4 opacity-0 transition-all group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:group-data-[streaming=false]:opacity-100"
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="mt-1 space-y-2">
                    <div className="-mx-1 mt-1 no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
                      {SEARCH_PILLS.map((pill) => (
                        <span
                          key={pill}
                          className="inline-flex h-6.5 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-xs leading-4.5 whitespace-nowrap text-muted-foreground sm:max-w-[187.8px] sm:whitespace-normal"
                        >
                          <HugeiconsIcon
                            icon={Globe02Icon}
                            strokeWidth={1.75}
                            className="size-4 shrink-0 text-muted-foreground/50"
                          />
                          <span className="min-w-0 sm:truncate">{pill}</span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-1.5 no-scrollbar flex max-h-[180px] w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-[12px] border border-border/50 bg-secondary p-3">
                      {SOURCES.map((source) => (
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div
            className="mt-0 flex animate-in items-center gap-2 text-sm leading-4.5 text-muted-foreground"
            style={{ opacity: 1, transform: "none" }}
          >
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              strokeWidth={1.75}
              className="size-4"
            />
            <span className="">Task complete</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ChainOfThoughtDefault;
