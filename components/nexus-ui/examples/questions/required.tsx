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
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSubmit,
  QuestionsTitle,
} from "@/components/nexus-ui/questions";
import { Toaster } from "@/components/nexus-ui/toaster";
import { toastSubmission } from "@/components/nexus-ui/examples/questions/submission-toast";

const TOASTER_ID = "questions-required";

const QUESTIONS: QuestionInput[] = [
  {
    id: "role",
    type: "single",
    prompt: "What is your role on the project?",
    required: true,
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
    required: true,
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
          <QuestionsSubmit disableUntilLastQuestion />
        </QuestionsFooter>
      </Questions>
      <Toaster id={TOASTER_ID} />
    </div>
  );
}

export default QuestionsRequired;
