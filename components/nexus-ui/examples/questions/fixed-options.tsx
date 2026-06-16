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

const QUESTION: QuestionInput = {
  id: "tone",
  type: "single",
  prompt: "What tone should I use in the reply?",
  allowOther: false,
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
        onSubmit={(answers) => {
          console.log(answers);
        }}
      >
        <QuestionsHeader>
          <QuestionsTitle />
        </QuestionsHeader>

        <Question
          id={QUESTION.id}
          type={QUESTION.type}
          prompt={QUESTION.prompt}
          allowOther={false}
          index={0}
        >
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
    </div>
  );
}

export default QuestionsFixedOptions;
