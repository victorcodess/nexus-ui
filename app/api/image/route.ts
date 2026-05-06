import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";

type ImageRequestBody = {
  prompt?: string;
  model?: string;
  size?: string;
};

const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-1";
type ImageSize = `${number}x${number}`;

const OPENAI_IMAGE_MODELS = ["gpt-image-1", "dall-e-3"] as const;

function resolveModel(model: string | undefined) {
  if (!model) return DEFAULT_OPENAI_IMAGE_MODEL;
  return (OPENAI_IMAGE_MODELS as readonly string[]).includes(model)
    ? model
    : DEFAULT_OPENAI_IMAGE_MODEL;
}

const MODEL_SIZE_MAP: Record<string, readonly ImageSize[]> = {
  "gpt-image-1": ["1024x1024", "1536x1024", "1024x1536"],
  "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
};

function resolveSize(model: string, size: string | undefined): ImageSize {
  const allowedSizes: readonly ImageSize[] = MODEL_SIZE_MAP[model] ?? [
    "1024x1024",
  ];
  if (!size) return allowedSizes[0];
  return allowedSizes.includes(size as ImageSize)
    ? (size as ImageSize)
    : allowedSizes[0];
}

export async function POST(req: Request) {
  const { prompt, model, size }: ImageRequestBody = await req.json();
  const trimmedPrompt = prompt?.trim();
  const selectedModel = resolveModel(model?.trim());
  const selectedSize = resolveSize(selectedModel, size?.trim());

  if (!trimmedPrompt) {
    return Response.json(
      { error: "Prompt is required" },
      {
        status: 400,
      },
    );
  }

  try {
    const { image } = await generateImage({
      model: openai.image(selectedModel),
      prompt: trimmedPrompt,
      size: selectedSize,
    });

    return Response.json({
      base64: image.base64,
      uint8Array: image.uint8Array ? Array.from(image.uint8Array) : undefined,
      mediaType: image.mediaType,
      model: selectedModel,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed";
    console.error("/api/image failed", {
      model: selectedModel,
      size: selectedSize,
      error: message,
    });
    return Response.json({ error: message }, { status: 500 });
  }
}
