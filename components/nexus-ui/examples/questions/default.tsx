"use client";

import {
  Question,
  QuestionOption,
  QuestionOptions,
  QuestionOther,
  type QuestionInput,
  Questions,
  QuestionsDismiss,
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";
import { Toaster } from "@/components/nexus-ui/toaster";
import { toastSubmission } from "@/components/nexus-ui/examples/questions/submission-toast";

const TOASTER_ID = "questions-default";

const QUESTION: QuestionInput = {
  id: "depth",
  type: "single",
  prompt: "How detailed should the explanation be?",
  options: [
    { value: "brief", label: "Brief overview" },
    { value: "standard", label: "Standard depth" },
    { value: "deep", label: "Deep dive with examples" },
  ],
};

function QuestionsDefault() {
  return (
    <div className="w-full">
      <Questions
        items={[QUESTION]}
        onSubmit={(submission) => toastSubmission(submission, TOASTER_ID)}
      >
        <QuestionsHeader>
          <QuestionsTitle />
          <QuestionsDismiss />
        </QuestionsHeader>

        <Question id={QUESTION.id}>
          <QuestionOptions>
            {QUESTION.options.map((option) => (
              <QuestionOption key={option.value} value={option.value}>
                {option.label}
              </QuestionOption>
            ))}
            <QuestionOther />
          </QuestionOptions>
        </Question>

        <QuestionsFooter>
          <QuestionsSubmit />
        </QuestionsFooter>
      </Questions>
      <Toaster id={TOASTER_ID} />
    </div>
  );
}

export default QuestionsDefault;
