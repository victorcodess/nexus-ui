import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  InformationCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  FeedbackBar,
  FeedbackBarAction,
  FeedbackBarActions,
  FeedbackBarClose,
  FeedbackBarContent,
  FeedbackBarLabel,
  FeedbackBarPrompt,
} from "@/components/nexus-ui/feedback-bar";

function FeedbackBarDefault() {
  return (
    <FeedbackBar>
      <FeedbackBarContent>
        <FeedbackBarPrompt>
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2.0}
            className="size-4 shrink-0"
          />
          <FeedbackBarLabel>Is this response helpful?</FeedbackBarLabel>
        </FeedbackBarPrompt>

        <FeedbackBarActions>
          <FeedbackBarAction asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer rounded-full bg-transparent transition-all active:scale-97"
              aria-label="Helpful"
            >
              <HugeiconsIcon
                icon={ThumbsUpIcon}
                strokeWidth={2.0}
                className="size-4 shrink-0"
              />
            </Button>
          </FeedbackBarAction>
          <FeedbackBarAction asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer rounded-full bg-transparent transition-all active:scale-97"
              aria-label="Not helpful"
            >
              <HugeiconsIcon
                icon={ThumbsDownIcon}
                strokeWidth={2.0}
                className="size-4 shrink-0"
              />
            </Button>
          </FeedbackBarAction>
        </FeedbackBarActions>
      </FeedbackBarContent>

      <FeedbackBarClose>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer rounded-full bg-transparent transition-all active:scale-97"
          aria-label="Close"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2.0}
            className="size-4 shrink-0"
          />
        </Button>
      </FeedbackBarClose>
    </FeedbackBar>
  );
}

export default FeedbackBarDefault;
