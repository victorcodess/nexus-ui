import {
  Image,
  ImageLightbox,
  ImageLightboxOverlay,
  ImageLightboxClose,
  ImageLightboxPreview,
  ImagePreview,
  ImageActions,
  ImageActionGroup,
  ImageAction,
} from "@/components/nexus-ui/image";
import { base64Image } from "@/components/nexus-ui/examples/image/base64";
import { Button } from "@/components/ui/button";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function ImageLightboxExample() {
  return (
    <Image
      base64={base64Image}
      mediaType="image/png"
      alt="Preview that opens in a lightbox"
      className="aspect-square w-1/2"
    >
      <ImagePreview className="cursor-pointer" />
      <ImageLightbox>
        <ImageLightboxOverlay />
        <ImageLightboxPreview />
        <ImageActions align="block-start" className="fixed z-60 justify-end">
          <ImageActionGroup>
            <ImageAction asChild>
              <ImageLightboxClose asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="cursor-pointer rounded-full bg-secondary text-[13px] text-primary backdrop-blur-lg hover:bg-secondary/80 active:scale-97"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </ImageLightboxClose>
            </ImageAction>
          </ImageActionGroup>
        </ImageActions>
      </ImageLightbox>
    </Image>
  );
}
