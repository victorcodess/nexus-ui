import {
  Image,
  ImageAction,
  ImageActionGroup,
  ImageActions,
  ImagePreview,
} from "@/components/nexus-ui/image";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Share01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";

export default function ImageWithActions() {
  const base64Image =
  "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 sm:flex-row">
      <Image
        base64={base64Image}
        mediaType="image/png"
        uint8Array={new Uint8Array([])}
        alt="Picture of a ball"
        className="aspect-square w-1/2 min-w-0"
      >
        <ImagePreview />
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
            <ImageAction asChild tooltip={{ content: "Copy image", shortcut: "C" }}>
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
            <ImageAction asChild tooltip={{ content: "Edit", side: "top" }}>
              <Button
                type="button"
                variant="secondary"
                className="h-8 cursor-pointer rounded-full bg-card/90 px-3 text-[13px] text-primary backdrop-blur-lg hover:bg-card active:scale-97"
              >
                Edit
              </Button>
            </ImageAction>
          </ImageActionGroup>

          <ImageActionGroup>
            <ImageAction
              asChild
              tooltip={{ content: "Download image", side: "left", shortcut: "D" }}
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

      <Image
        base64={base64Image}
        mediaType="image/png"
        uint8Array={new Uint8Array([])}
        alt="Picture of a ball"
        className="aspect-square w-1/2 min-w-0"
      >
        <ImagePreview />
        <ImageActions align="inline-start" className="justify-center">
          <ImageActionGroup className="flex-col">
            <ImageAction asChild tooltip={{ content: "Share image", side: "right" }}>
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
            <ImageAction asChild tooltip="Copy image">
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

        <ImageActions align="inline-end" className="items-end">
          <ImageActionGroup>
            <ImageAction asChild tooltip="Edit">
              <Button
                type="button"
                variant="secondary"
                className="h-8 cursor-pointer rounded-full bg-card/90 px-3 text-[13px] text-primary backdrop-blur-lg hover:bg-card active:scale-97"
              >
                Edit
              </Button>
            </ImageAction>
          </ImageActionGroup>

          <ImageActionGroup>
            <ImageAction asChild tooltip={{ content: "Download image", shortcut: "D" }}>
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
