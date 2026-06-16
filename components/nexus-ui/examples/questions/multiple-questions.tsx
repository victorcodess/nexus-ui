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
  QuestionsCarouselIndex,
  QuestionsCarouselItem,
  QuestionsCarouselNext,
  QuestionsCarouselPagination,
  QuestionsCarouselPrev,
  QuestionsDismiss,
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSkip,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";

const QUESTIONS: QuestionInput[] = [
  {
    id: "trip-type",
    type: "single",
    prompt: "What kind of trip are you planning?",
    options: [
      { value: "leisure", label: "Leisure" },
      { value: "business", label: "Business" },
      { value: "family", label: "Family visit" },
    ],
  },
  {
    id: "budget",
    type: "single",
    prompt: "What's your nightly budget?",
    options: [
      { value: "budget", label: "Under $150" },
      { value: "mid", label: "$150–$300" },
      { value: "luxury", label: "$300+" },
    ],
  },
  {
    id: "priorities",
    type: "multiple",
    prompt: "What matters most for this stay?",
    options: [
      { value: "location", label: "Central location" },
      { value: "quiet", label: "Quiet room" },
      { value: "breakfast", label: "Breakfast included" },
      { value: "gym", label: "Gym access" },
    ],
  },
];

function QuestionsMultipleQuestions() {
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
            <QuestionsDismiss />
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

export default QuestionsMultipleQuestions;
