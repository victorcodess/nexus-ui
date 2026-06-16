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

const QUESTION: QuestionInput = {
  id: "topics",
  type: "multiple",
  prompt: "Which topics should I cover in the answer?",
  options: [
    { value: "setup", label: "Project setup" },
    { value: "routing", label: "Routing and layouts" },
    { value: "data", label: "Data fetching" },
    { value: "deployment", label: "Deployment" },
  ],
};

function QuestionsMultipleChoice() {
  return (
    <div className="w-full">
      <Questions
        items={[QUESTION]}
        onSubmit={(answers) => {
          console.log(answers);
        }}
      >
        <QuestionsHeader>
          <QuestionsTitle />
          <QuestionsDismiss />
        </QuestionsHeader>

        <Question
          id={QUESTION.id}
          type={QUESTION.type}
          prompt={QUESTION.prompt}
          index={0}
        >
          <QuestionOptions>
            {QUESTION.options.map((option) => (
              <QuestionOption key={option.value} value={option.value}>
                {option.label}
              </QuestionOption>
            ))}
            <QuestionOther placeholder="Something else..." />
          </QuestionOptions>
        </Question>

        <QuestionsFooter>
          <QuestionsSubmit />
        </QuestionsFooter>
      </Questions>
    </div>
  );
}

export default QuestionsMultipleChoice;
