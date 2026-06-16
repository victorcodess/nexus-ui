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
import { Toaster } from "@/components/nexus-ui/toaster";
import { toastSubmission } from "@/components/nexus-ui/examples/questions/submission-toast";

const TOASTER_ID = "questions-multiple-questions";

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
        onSubmit={(submission) => toastSubmission(submission, TOASTER_ID)}
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
            {QUESTIONS.map((question) => (
              <QuestionsCarouselItem key={question.id}>
                <Question id={question.id}>
                  <QuestionOptions>
                    {question.options.map((option) => (
                      <QuestionOption key={option.value} value={option.value}>
                        {option.label}
                      </QuestionOption>
                    ))}
                    <QuestionOther />
                  </QuestionOptions>
                </Question>
              </QuestionsCarouselItem>
            ))}
          </QuestionsCarouselContent>
        </QuestionsCarousel>

        <QuestionsFooter>
          <QuestionsSkip />
          <QuestionsSubmit disableUntilLastQuestion />
        </QuestionsFooter>
      </Questions>
      <Toaster id={TOASTER_ID} />
    </div>
  );
}

export default QuestionsMultipleQuestions;
