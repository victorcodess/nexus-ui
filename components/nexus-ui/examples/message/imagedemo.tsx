"use client";

import * as React from "react";
import { motion } from "motion/react";
import ChatgptIcon from "@/components/svgs/chatgpt";
import {
  ArrowUp02Icon,
  Copy01Icon,
  Download01Icon,
  Edit04Icon,
  PlusSignIcon,
  RepeatIcon,
  Share01Icon,
  SquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Image,
  ImageAction,
  ImageActionGroup,
  ImageActions,
  ImagePreview,
} from "@/components/nexus-ui/image";
import {
  Message,
  MessageAction,
  MessageActionGroup,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
import { Button } from "@/components/ui/button";

type GeneratedImage = {
  base64?: string;
  uint8Array?: number[];
  mediaType?: string;
};

type DemoMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: GeneratedImage;
  pending?: boolean;
};

const imgUser = "/assets/user-avatar.avif";
const imgAssistant = "/assets/nexus-avatar.png";

const models = [
  {
    value: "openai/gpt-image-1",
    icon: ChatgptIcon,
    title: "GPT Image 1",
    description: "High quality image generation",
  },
  {
    value: "openai/dall-e-3",
    icon: ChatgptIcon,
    title: "DALL-E 3",
    description: "Creative image generation",
  },
] as const;

const DEFAULT_MODEL = "openai/gpt-image-1";

function hasImagePayload(image?: GeneratedImage) {
  return Boolean(image?.base64 || image?.uint8Array?.length);
}

function extensionFromMediaType(mediaType: string) {
  if (mediaType === "image/jpeg") return "jpg";
  if (mediaType === "image/webp") return "webp";
  return "png";
}

export default function ImageDemo() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<DemoMessage[]>([]);
  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const copyMessage = React.useCallback((text: string) => {
    void navigator.clipboard?.writeText(text);
  }, []);

  const handleDownloadImage = React.useCallback((image?: GeneratedImage) => {
    if (!image) return;

    const mediaType = image.mediaType ?? "image/png";
    let url: string | undefined;
    let shouldRevokeObjectUrl = false;

    if (image.base64) {
      url = image.base64.startsWith("data:")
        ? image.base64
        : `data:${mediaType};base64,${image.base64}`;
    } else if (image.uint8Array?.length) {
      const blob = new Blob([new Uint8Array(image.uint8Array)], { type: mediaType });
      url = URL.createObjectURL(blob);
      shouldRevokeObjectUrl = true;
    }

    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-image.${extensionFromMediaType(mediaType)}`;
    a.click();

    if (shouldRevokeObjectUrl) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleSubmit = React.useCallback(
    async (value: string) => {
      const prompt = value.trim();
      if (!prompt || busy) return;

      setBusy(true);
      setInput("");
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: DemoMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: prompt,
      };
      const pendingId = crypto.randomUUID();
      const pendingAssistant: DemoMessage = {
        id: pendingId,
        role: "assistant",
        text: "",
        pending: true,
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistant]);

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, model }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to generate image");
        }

        const data = (await response.json()) as GeneratedImage;
        const assistantMessage: DemoMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Generated with ${model}`,
          image: data,
        };

        setMessages((prev) =>
          prev.map((entry) =>
            entry.id === pendingId ? assistantMessage : entry,
          ),
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) => prev.filter((entry) => entry.id !== pendingId));
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to generate image";
        setError(message);
        setMessages((prev) =>
          prev.map((entry) =>
            entry.id === pendingId
              ? {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  text: "Image generation failed. Please try again.",
                }
              : entry,
          ),
        );
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, model],
  );

  const handleRegenerate = React.useCallback(async () => {
    if (busy) return;
    const lastUserPrompt = [...messages]
      .reverse()
      .find((entry) => entry.role === "user")?.text;
    if (!lastUserPrompt) return;
    await handleSubmit(lastUserPrompt);
  }, [busy, messages, handleSubmit]);

  const handleStop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  console.log("messages image", messages);

  return (
    <div className="relative flex h-screen items-start px-0 pt-5 lg:px-0 lg:pt-20">
      <Thread className="h-[75vh]">
        <ThreadContent className="mx-auto max-w-2xl pb-40">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            const binaryImage = message.image?.uint8Array
              ? new Uint8Array(message.image.uint8Array)
              : undefined;
            const showImage = hasImagePayload(message.image);

            return (
              <motion.div
                key={message.id}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: message.role === "assistant" ? 0.14 : 0,
                }}
              >
                {message.role === "user" ? (
                  <Message from="user">
                    <MessageStack>
                      <MessageContent>
                        <MessageMarkdown>{message.text}</MessageMarkdown>
                      </MessageContent>
                      <MessageActions className="opacity-0 transition-opacity group-hover/message:opacity-100">
                        <MessageActionGroup>
                          <MessageAction asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                              aria-label="Edit message"
                            >
                              <HugeiconsIcon
                                icon={Edit04Icon}
                                strokeWidth={2.0}
                                className="size-4"
                              />
                            </Button>
                          </MessageAction>
                          <MessageAction asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                              aria-label="Copy message"
                              onClick={() => copyMessage(message.text)}
                            >
                              <HugeiconsIcon
                                icon={Copy01Icon}
                                strokeWidth={2.0}
                                className="size-4"
                              />
                            </Button>
                          </MessageAction>
                        </MessageActionGroup>
                      </MessageActions>
                    </MessageStack>
                    <MessageAvatar src={imgUser} alt="" fallback="U" />
                  </Message>
                ) : (
                  <Message from="assistant">
                    <MessageAvatar src={imgAssistant} alt="" fallback="A" />
                    <MessageStack className="min-w-0 flex-1">
                      <MessageContent>
                        {message.pending && isLast ? (
                          <TextShimmer className="text-sm leading-6 text-muted-foreground">
                            Generating image...
                          </TextShimmer>
                        ) : showImage ? (
                          <Image
                            base64={message.image?.base64}
                            uint8Array={binaryImage}
                            mediaType={message.image?.mediaType ?? "image/png"}
                            alt={message.text}
                            className="w-full overflow-hidden rounded-xl border"
                          >
                            <ImagePreview />
                            <ImageActions align="block-start" className="justify-end opacity-0 group-hover/image:opacity-100 transition-opacity">
                              <ImageActionGroup>
                                <ImageAction asChild>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="secondary"
                                    className="cursor-pointer rounded-full bg-card/90 text-primary backdrop-blur-lg hover:bg-card active:scale-97"
                                    aria-label="Share image"
                                  >
                                    <HugeiconsIcon
                                      icon={Share01Icon}
                                      strokeWidth={2.0}
                                      className="size-4"
                                    />
                                  </Button>
                                </ImageAction>
                                <ImageAction asChild>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="secondary"
                                    className="cursor-pointer rounded-full bg-card/90 text-primary backdrop-blur-lg hover:bg-card active:scale-97"
                                    aria-label="Copy image description"
                                    onClick={() => copyMessage(message.text)}
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
                            <ImageActions align="block-end" className="justify-end opacity-0 group-hover/image:opacity-100 transition-opacity">
                              <ImageActionGroup>
                                <ImageAction asChild>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="secondary"
                                    className="cursor-pointer rounded-full bg-card/90 text-primary backdrop-blur-lg hover:bg-card active:scale-97"
                                    aria-label="Download image"
                                    onClick={() => handleDownloadImage(message.image)}
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
                        ) : (
                          <MessageMarkdown>{message.text}</MessageMarkdown>
                        )}
                      </MessageContent>

                      {!message.pending && isLast ? (
                        <MessageActions>
                          <MessageActionGroup>
                            <MessageAction asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                                aria-label="Copy message"
                                onClick={() => copyMessage(message.text)}
                              >
                                <HugeiconsIcon
                                  icon={Copy01Icon}
                                  strokeWidth={2.0}
                                  className="size-4"
                                />
                              </Button>
                            </MessageAction>
                            <MessageAction asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                                aria-label="Good response"
                              >
                                <HugeiconsIcon
                                  icon={ThumbsUpIcon}
                                  strokeWidth={2.0}
                                  className="size-4"
                                />
                              </Button>
                            </MessageAction>
                            <MessageAction asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                                aria-label="Bad response"
                              >
                                <HugeiconsIcon
                                  icon={ThumbsDownIcon}
                                  strokeWidth={2.0}
                                  className="size-4"
                                />
                              </Button>
                            </MessageAction>
                            <MessageAction asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                                aria-label="Regenerate"
                                disabled={busy}
                                onClick={() => void handleRegenerate()}
                              >
                                <HugeiconsIcon
                                  icon={RepeatIcon}
                                  strokeWidth={2.0}
                                  className="size-4"
                                />
                              </Button>
                            </MessageAction>
                          </MessageActionGroup>
                        </MessageActions>
                      ) : null}
                    </MessageStack>
                  </Message>
                )}
              </motion.div>
            );
          })}
        </ThreadContent>
        <ThreadScrollToBottom className="bottom-0 z-50" />
      </Thread>

      <div className="fixed right-0 bottom-0 left-0 z-10 flex w-full items-center justify-center border-t border-accent bg-background/70 px-6 pt-6 pb-12 backdrop-blur-sm dark:bg-background/95">
        <div className="mx-auto w-full max-w-xl space-y-2">
          {error ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <span className="min-w-0 flex-1">{error}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          ) : null}

          <PromptInput
            onSubmit={(value) => void handleSubmit(value)}
            className="shadow-sm"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the image you want..."
              disabled={busy}
            />
            <PromptInputActions>
              <PromptInputActionGroup>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                    aria-label="More actions"
                    disabled={busy}
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  </Button>
                </PromptInputAction>
              </PromptInputActionGroup>

              <PromptInputActionGroup>
                <PromptInputAction asChild>
                  <ModelSelector
                    value={model}
                    onValueChange={setModel}
                    items={[...models]}
                  >
                    <ModelSelectorTrigger variant="ghost" disabled={busy} />
                    <ModelSelectorContent className="w-[264px]" align="end">
                      <ModelSelectorGroup>
                        <ModelSelectorLabel>Select model</ModelSelectorLabel>
                        <ModelSelectorRadioGroup
                          value={model}
                          onValueChange={setModel}
                        >
                          {models.map((item) => (
                            <ModelSelectorRadioItem
                              key={item.value}
                              value={item.value}
                              icon={item.icon}
                              title={item.title}
                              description={item.description}
                            />
                          ))}
                        </ModelSelectorRadioGroup>
                      </ModelSelectorGroup>
                    </ModelSelectorContent>
                  </ModelSelector>
                </PromptInputAction>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    size="icon-sm"
                    className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
                    disabled={!busy && !input.trim()}
                    onClick={() => {
                      if (busy) {
                        handleStop();
                        return;
                      }
                      void handleSubmit(input);
                    }}
                    aria-label={busy ? "Stop generation" : "Send prompt"}
                  >
                    {busy ? (
                      <HugeiconsIcon
                        icon={SquareIcon}
                        strokeWidth={2.0}
                        className="size-3.5 fill-current"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={ArrowUp02Icon}
                        strokeWidth={2.0}
                        className="size-4"
                      />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActionGroup>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
