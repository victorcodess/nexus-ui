"use client";

import {
  Question,
  QuestionOption,
  QuestionOptions,
  QuestionOther,
  type QuestionInput,
  Questions,
  QuestionsCarousel,
  QuestionsCarouselContent,
  QuestionsCarouselHeader,
  QuestionsCarouselIndex,
  QuestionsCarouselItem,
  QuestionsCarouselNext,
  QuestionsCarouselPagination,
  QuestionsCarouselPrev,
  QuestionsDismiss,
  QuestionsFooter,
  QuestionsSkip,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";

const QUESTIONS: QuestionInput[] = [
  {
    id: "goal",
    type: "single",
    prompt: "What's your primary fitness goal?",
    options: [
      { value: "muscle", label: "Build muscle" },
      { value: "weight", label: "Lose weight" },
      { value: "health", label: "Improve health" },
      { value: "strength", label: "Gain strength" },
    ],
  },
  {
    id: "focus",
    type: "multiple",
    prompt: "Which areas do you want to focus on?",
    options: [
      { value: "muscle", label: "Build muscle" },
      { value: "weight", label: "Lose weight" },
      { value: "health", label: "Improve health" },
      { value: "strength", label: "Gain strength" },
    ],
  },
];

function QuestionsDefault() {
  return (
    <div className="w-full">
      <Questions
        items={QUESTIONS}
        onSubmit={(answers) => {
          console.log(answers);
        }}
      >
        <QuestionsCarousel>
          <QuestionsCarouselHeader>
            <QuestionsTitle />
            <QuestionsCarouselPagination>
              <QuestionsCarouselPrev />
              <QuestionsCarouselIndex format="of" />
              <QuestionsCarouselNext />
            </QuestionsCarouselPagination>
            <QuestionsDismiss />
          </QuestionsCarouselHeader>

          <QuestionsCarouselContent className="mx-0">
            {QUESTIONS.map((question, index) => (
              <QuestionsCarouselItem key={question.id} index={index}>
                <Question
                  id={question.id}
                  type={question.type}
                  prompt={question.prompt}
                  required={question.required}
                  allowOther={question.allowOther}
                >
                  <QuestionOptions>
                    {question.options.map((option) => (
                      <QuestionOption key={option.value} value={option.value}>
                        {option.label}
                      </QuestionOption>
                    ))}
                    {question.allowOther !== false ? <QuestionOther /> : null}
                  </QuestionOptions>
                </Question>
              </QuestionsCarouselItem>
            ))}
          </QuestionsCarouselContent>
        </QuestionsCarousel>

        <QuestionsFooter>
          <QuestionsSkip />
          <QuestionsSubmit />
        </QuestionsFooter>
      </Questions>
    </div>
  );
}

export default QuestionsDefault;
