"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import PromptInputMultipleActions from "@/components/nexus-ui/examples/prompt-input/multiple-actions";
import PromptInputBasic from "@/components/nexus-ui/examples/prompt-input/basic";
import SuggestionDefault from "@/components/nexus-ui/examples/suggestion/default";
import SuggestionWithIcons from "@/components/nexus-ui/examples/suggestion/with-icons";
import SuggestionVertical from "@/components/nexus-ui/examples/suggestion/vertical";
import AttachmentsDefault from "@/components/nexus-ui/examples/attachments/default";
import AttachmentsVariantInline from "@/components/nexus-ui/examples/attachments/variant-inline";
import AttachmentsVariantDetailed from "@/components/nexus-ui/examples/attachments/variant-detailed";
import ModelSelectorBasic from "@/components/nexus-ui/examples/model-selector/basic";
import ModelSelectorDefault from "@/components/nexus-ui/examples/model-selector/default";
import ModelSelectorWithSearch from "@/components/nexus-ui/examples/model-selector/with-search";
import ModelSelectorTriggerVariants from "@/components/nexus-ui/examples/model-selector/trigger-variants";
import ModelSelectorCustomTrigger from "@/components/nexus-ui/examples/model-selector/custom-trigger";
import ModelSelectorWithSub from "@/components/nexus-ui/examples/model-selector/with-sub";
import ModelSelectorWithCheckbox from "@/components/nexus-ui/examples/model-selector/with-checkbox";
import MessageDefault from "@/components/nexus-ui/examples/message/default";
import MessageWithAvatar from "@/components/nexus-ui/examples/message/with-avatar";
import MessageWithActions from "@/components/nexus-ui/examples/message/with-actions";

const GAP_PX = 40;
/** Each column is at most this wide; grid caps at three tracks + gutters. */
const COL_MAX_PX = 447;
const GRID_MAX_WIDTH_PX = COL_MAX_PX * 3 + GAP_PX * 2;

/** Deterministic shuffle so SSR and client match (no hydration mismatch). */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

type DemoSlot = { key: string; node: ReactNode };

function PromptSlot({ children }: { children: ReactNode }) {
  return <div className="min-w-full max-w-[400px]">{children}</div>;
}

const BASE_SLOTS: DemoSlot[] = [
  {
    key: "prompt-default",
    node: (
      <PromptSlot>
        <PromptInputMultipleActions />
      </PromptSlot>
    ),
  },
  {
    key: "prompt-basic",
    node: (
      <div
        className="flex flex-col items-end justify-between"
        style={{ gap: GAP_PX + 32 }}
      >
        <PromptSlot>
          <PromptInputBasic />
        </PromptSlot>
        <ModelSelectorTriggerVariants />
      </div>
    ),
  },
  { key: "suggestion-default", node: <SuggestionDefault /> },
  { key: "suggestion-icons", node: <SuggestionWithIcons /> },
  { key: "suggestion-vertical", node: <SuggestionVertical /> },
  { key: "attachments-default", node: <AttachmentsDefault /> },
  { key: "attachments-inline", node: <AttachmentsVariantInline /> },
  {
    key: "attachments-detailed",
    node: <AttachmentsVariantDetailed />,
  },
  {
    key: "model-selectors-a",
    node: (
      <div className="flex flex-col" style={{ gap: GAP_PX }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <ModelSelectorBasic />
          <ModelSelectorDefault />
          <ModelSelectorWithSearch />
        </div>
      </div>
    ),
  },
  {
    key: "model-selectors-b",
    node: (
      <div className="flex flex-wrap items-start justify-start gap-4 text-sm">
        <ModelSelectorCustomTrigger />
        <ModelSelectorWithSub />
        <ModelSelectorWithCheckbox />
      </div>
    ),
  },
  { key: "message-default", node: <MessageDefault /> },
  { key: "message-avatar", node: <MessageWithAvatar /> },
  { key: "message-actions", node: <MessageWithActions /> },
];

export default function ThemeDemo() {
  const columns = useMemo(() => {
    const shuffled = shuffleDeterministic(BASE_SLOTS, 0x4e657801);
    return [0, 1, 2].map((col) => shuffled.filter((_, i) => i % 3 === col)) as [
      DemoSlot[],
      DemoSlot[],
      DemoSlot[],
    ];
  }, []);

  return (
    <div className="dark h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="box-border flex h-full min-h-0 items-center justify-center p-6 sm:p-8">
        <div className="box-border max-h-[calc(100vh-3rem)] max-w-[calc(100vw-8rem)] overflow-auto">
                   <div
            className="mx-auto grid w-full items-start"
            style={{
              maxWidth: GRID_MAX_WIDTH_PX,
              gridTemplateColumns: `repeat(3, minmax(0, ${COL_MAX_PX}px))`,
              columnGap: GAP_PX,
            }}
          >
            {columns.map((cells, colIndex) => (
              <div
                key={colIndex}
                className="flex min-w-0 flex-col"
                style={{ gap: GAP_PX }}
              >
                {cells.map((slot) => (
                  <div key={slot.key}>{slot.node}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
