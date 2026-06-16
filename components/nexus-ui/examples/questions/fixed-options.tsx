"use client";

import {
  Question,
  QuestionOption,
  QuestionOptions,
  type QuestionInput,
  Questions,
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";
import { Toaster } from "@/components/nexus-ui/toaster";
import { toastSubmission } from "@/components/nexus-ui/examples/questions/submission-toast";

const TOASTER_ID = "questions-fixed-options";

const QUESTION: QuestionInput = {
  id: "tone",
  type: "single",
  prompt: "What tone should I use in the reply?",
  options: [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "concise", label: "Concise" },
  ],
};

function QuestionsFixedOptions() {
  return (
    <div className="w-full">
      <Questions
        items={[QUESTION]}
        onSubmit={(submission) => toastSubmission(submission, TOASTER_ID)}
      >
        <QuestionsHeader>
          <QuestionsTitle />
        </QuestionsHeader>

        <Question id={QUESTION.id}>
          <QuestionOptions>
            {QUESTION.options.map((option) => (
              <QuestionOption key={option.value} value={option.value}>
                {option.label}
              </QuestionOption>
            ))}
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

export default QuestionsFixedOptions;
