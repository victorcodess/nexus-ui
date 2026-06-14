import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function QuestionsDefault() {
  return (
    <div className="w-full">
      <Card className="mx-auto w-full max-w-lg gap-0 rounded-2xl px-0 pt-3 pb-0 shadow-xl shadow-border/50 dark:border-accent dark:shadow-background/50">
        <Carousel>
          <CardHeader className="flex w-full items-center justify-center gap-2.5 pr-3 pb-1.5 pl-4">
            <CardTitle className="flex-1 text-sm font-normal">
              What&apos;s your primary fitness goal?
            </CardTitle>

            <div
              data-slot="citation-carousel-pagination"
              className="flex items-center gap-0.5"
            >
              <button
                type="button"
                className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-97 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
              <span className="text-xs leading-4.5 font-[350] text-muted-foreground tabular-nums">
                1 of 2
              </span>
              <button
                type="button"
                className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-97 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
            </div>

            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="cursor-pointer rounded-full bg-transparent text-[13px] text-muted-foreground backdrop-blur-lg hover:bg-secondary/80 active:scale-97"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2.0}
                className="size-3.5"
              />
            </Button>
          </CardHeader>
          <CarouselContent className="mx-0">
            <CarouselItem className="w-full self-start p-0">
              <CardContent className="w-full p-1.5">
                <div className="flex w-full flex-col gap-0 [&>*+*]:relative [&>*+*]:before:pointer-events-none [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:right-2.5 [&>*+*]:before:left-2.5 [&>*+*]:before:z-10 [&>*+*]:before:h-px [&>*+*]:before:bg-border/20 [&>*+*]:before:content-['']">
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99"
                  >
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
                      <span className="text-sm text-muted-foreground transition-all group-hover/row:text-primary">
                        1
                      </span>
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Build muscle
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2.0}
                      className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
                    />
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99"
                  >
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
                      <span className="text-sm text-muted-foreground transition-all group-hover/row:text-primary">
                        2
                      </span>
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Lose weight
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2.0}
                      className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
                    />
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99"
                  >
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
                      <span className="text-sm text-muted-foreground transition-all group-hover/row:text-primary">
                        3
                      </span>
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Improve health
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2.0}
                      className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
                    />
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    tabIndex={-1}
                    className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99"
                  >
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
                      <span className="text-sm text-muted-foreground transition-all group-hover/row:text-primary">
                        4
                      </span>
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Gain strength
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2.0}
                      className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
                    />
                  </button>
                  <div className="group/row flex h-11 w-full cursor-text items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted">
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
                      <HugeiconsIcon
                        icon={Edit03Icon}
                        strokeWidth={2.0}
                        className="size-4 text-muted-foreground transition-all group-hover/row:text-primary"
                      />
                    </span>

                    <input
                      type="text"
                      placeholder="Other..."
                      className="gtext-primary h-full min-w-0 flex-1 truncate text-sm transition-all outline-none placeholder:text-ring"
                    />
                  </div>
                </div>
              </CardContent>
            </CarouselItem>
            <CarouselItem className="w-full self-start p-0">
              <CardContent className="w-full p-1.5">
                <div className="flex w-full flex-col gap-0 [&>*+*]:relative [&>*+*]:before:pointer-events-none [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:right-2.5 [&>*+*]:before:left-2.5 [&>*+*]:before:z-10 [&>*+*]:before:h-px [&>*+*]:before:bg-border/20 [&>*+*]:before:content-['']">
                  <label className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99">
                    <Checkbox className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50" />

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Build muscle 2
                    </span>
                  </label>
                  <label className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99">
                    <Checkbox className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50" />

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Lose weight
                    </span>
                  </label>
                  <label className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99">
                    <Checkbox className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50" />

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Improve health
                    </span>
                  </label>
                  <label className="group/row flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99">
                    <Checkbox className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50" />

                    <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
                      Gain strength
                    </span>
                  </label>
                  <label className="group/row flex h-11 w-full cursor-text items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted">
                  <Checkbox className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50" />

                    <input
                      type="text"
                      placeholder="Other..."
                      className="text-primary h-full min-w-0 flex-1 truncate text-sm transition-all outline-none placeholder:text-ring/70"
                    />
                  </label>
                </div>
              </CardContent>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <CardFooter className="justify-end gap-2 border-none bg-transparent px-3 pt-0 pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary active:scale-99"
          >
            Skip
          </Button>
          <Button variant="default" size="sm" className="active:scale-99">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default QuestionsDefault;
