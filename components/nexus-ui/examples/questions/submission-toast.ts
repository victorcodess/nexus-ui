import { createElement } from "react";
import { toast } from "@/components/nexus-ui/toaster";
import type { QuestionsSubmission } from "@/components/nexus-ui/questions";

function submissionDescription(submission: QuestionsSubmission) {
  return createElement(
    "div",
    { className: "flex flex-col gap-1" },
    submission.map((entry) => {
      const label =
        entry.type === "single"
          ? String(entry.answer.label)
          : entry.answer.map((item) => item.label).join(", ");
      return createElement(
        "div",
        { key: entry.questionId },
        `Q: ${entry.prompt}: ${label}`,
      );
    }),
  );
}

export function toastSubmission(
  submission: QuestionsSubmission,
  toasterId: string,
) {
  toast.default("Answers submitted", {
    description: submissionDescription(submission),
    toasterId,
  });
}
