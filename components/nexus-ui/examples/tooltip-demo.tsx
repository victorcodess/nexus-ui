"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Download01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import PromptInputMultipleActions from "@/components/nexus-ui/examples/prompt-input/multiple-actions";
import MessageWithActions from "@/components/nexus-ui/examples/message/with-actions";
import {
  Image,
  ImageAction,
  ImageActionGroup,
  ImageActions,
  ImagePreview,
} from "@/components/nexus-ui/image";

const EXAMPLES = [
  {
    id: "prompt-input",
    title: "Prompt input actions",
    render: () => <PromptInputMultipleActions />,
  },
  {
    id: "message",
    title: "Message actions",
    render: () => <MessageWithActions />,
  },
  {
    id: "image",
    title: "Image actions",
    render: () => <ImageActionsSrcExample />,
  },
];

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: "easeInOut" },
} satisfies Parameters<typeof motion.div>[0];

function ImageActionsSrcExample() {
  const base64Image =
  "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC";

  return (
    <div className="flex w-full justify-center">
      <Image
        base64={base64Image}
        mediaType="image/png"
        uint8Array={new Uint8Array([])}
        alt="Image loaded from external URL"
        className="aspect-square w-full max-w-sm min-w-0"
      >
        <ImagePreview  />
        <ImageActions align="block-start" className="justify-start">
          <ImageActionGroup>
            <ImageAction asChild tooltip="Share image">
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="cursor-pointer rounded-full bg-card/90 text-[13px] text-primary backdrop-blur-lg hover:bg-card active:scale-97"
              >
                <HugeiconsIcon
                  icon={Share01Icon}
                  strokeWidth={2.0}
                  className="size-4"
                />
              </Button>
            </ImageAction>
            <ImageAction
              asChild
              tooltip={{ content: "Copy image", shortcut: "C" }}
            >
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="cursor-pointer rounded-full bg-card/90 text-[13px] text-primary backdrop-blur-lg hover:bg-card active:scale-97"
              >
                <HugeiconsIcon
                  icon={Copy01Icon}
                  strokeWidth={2.0}
                  className="size-4"
                />
              </Button>
            </ImageAction>
          </ImageActionGroup>
        </ImageActions>

        <ImageActions align="block-end">
          <ImageActionGroup>
            <ImageAction
              asChild
              tooltip={{
                content: "Download image",
                side: "left",
                shortcut: "D",
              }}
            >
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="cursor-pointer rounded-full bg-card/90 text-[13px] text-primary backdrop-blur-lg hover:bg-card active:scale-97"
              >
                <HugeiconsIcon
                  icon={Download01Icon}
                  strokeWidth={2.0}
                  className="size-4"
                />
              </Button>
            </ImageAction>
          </ImageActionGroup>
        </ImageActions>
      </Image>
    </div>
  );
}

export default function TooltipDemo() {
  const [index, setIndex] = React.useState(0);

  const goToNextExample = React.useCallback(() => {
    setIndex((current) => (current + 1) % EXAMPLES.length);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey || event.key.toLowerCase() !== "j") return;
      event.preventDefault();
      goToNextExample();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToNextExample]);

  const current = EXAMPLES[index];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-card p-5">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} {...fade}>
            {current.render()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
