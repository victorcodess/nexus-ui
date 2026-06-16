"use client";

import {
  Question,
  QuestionOption,
  QuestionOptions,
  type QuestionInput,
  Questions,
  QuestionsCarousel,
  QuestionsCarouselContent,
  QuestionsCarouselIndex,
  QuestionsCarouselItem,
  QuestionsCarouselNext,
  QuestionsCarouselPagination,
  QuestionsCarouselPrev,
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSkip,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";

const QUESTIONS: QuestionInput[] = [
  {
    id: "role",
    type: "single",
    prompt: "What is your role on the project?",
    required: true,
    allowOther: false,
    options: [
      { value: "engineer", label: "Engineer" },
      { value: "designer", label: "Designer" },
      { value: "pm", label: "Product manager" },
    ],
  },
  {
    id: "timeline",
    type: "single",
    prompt: "When do you need this shipped?",
    options: [
      { value: "asap", label: "This week" },
      { value: "month", label: "This month" },
      { value: "later", label: "No rush" },
    ],
  },
];

function QuestionsRequired() {
  return (
    <div className="w-full">
      <Questions
        items={QUESTIONS}
        onSubmit={(answers) => {
          console.log(answers);
        }}
      >
        <QuestionsCarousel>
          <QuestionsHeader>
            <QuestionsTitle />
            <QuestionsCarouselPagination>
              <QuestionsCarouselPrev />
              <QuestionsCarouselIndex format="of" />
              <QuestionsCarouselNext />
            </QuestionsCarouselPagination>
          </QuestionsHeader>

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

export default QuestionsRequired;
