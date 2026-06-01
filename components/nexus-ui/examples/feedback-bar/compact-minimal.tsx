import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  FeedbackBar,
  FeedbackBarAction,
  FeedbackBarActions,
  FeedbackBarClose,
  FeedbackBarContent,
} from "@/components/nexus-ui/feedback-bar";

function FeedbackBarCompactMinimal() {
  return (
    <FeedbackBar className="w-auto">
      <FeedbackBarContent>
        <FeedbackBarActions>
          <FeedbackBarAction asChild tooltip="Helpful">
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
          <FeedbackBarAction asChild tooltip="Not helpful">
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

      <FeedbackBarClose tooltip="Close">
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

export default FeedbackBarCompactMinimal;
