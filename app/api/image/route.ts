import { generateImage } from "ai";

type ImageRequestBody = {
  prompt?: string;
  model?: string;
};

const DEFAULT_OPENAI_IMAGE_MODEL = "openai/gpt-image-1";

const OPENAI_IMAGE_MODELS = [
  "openai/gpt-image-1",
  "openai/dall-e-3",
] as const;

function resolveModel(model: string | undefined) {
  if (!model) return DEFAULT_OPENAI_IMAGE_MODEL;
  return (OPENAI_IMAGE_MODELS as readonly string[]).includes(model)
    ? model
    : DEFAULT_OPENAI_IMAGE_MODEL;
}

export async function POST(req: Request) {
  const { prompt, model }: ImageRequestBody = await req.json();
  const trimmedPrompt = prompt?.trim();
  const selectedModel = resolveModel(model?.trim());

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
      model: selectedModel,
      prompt: trimmedPrompt,
      size: "2160x2160",
    });

    return Response.json({
      base64: image.base64,
      uint8Array: image.uint8Array ? Array.from(image.uint8Array) : undefined,
      mediaType: image.mediaType,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
