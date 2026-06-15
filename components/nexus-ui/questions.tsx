"use client";

import * as React from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type QuestionType = "single" | "multiple";

export type QuestionOptionInput = {
  value: string;
  label: React.ReactNode;
};

export type QuestionInput = {
  id: string;
  type: QuestionType;
  prompt: React.ReactNode;
  options: QuestionOptionInput[];
  required?: boolean;
  allowOther?: boolean;
};

export const QUESTION_OTHER_VALUE = "__other__";

export type RegisteredQuestion = {
  id: string;
  type: QuestionType;
  prompt: React.ReactNode;
  required?: boolean;
  allowOther?: boolean;
  index: number;
};

export type SingleQuestionAnswerState =
  | { status: "answered"; value: string; other?: string }
  | { status: "skipped"; value: null };

export type MultipleQuestionAnswerState =
  | { status: "answered"; value: string[]; other?: string }
  | { status: "skipped"; value: [] };

export type QuestionAnswerState =
  | ({ type: "single" } & SingleQuestionAnswerState)
  | ({ type: "multiple" } & MultipleQuestionAnswerState);

export type QuestionsSubmission = Array<
  | {
      questionId: string;
      type: "single";
      status: "answered";
      value: string;
      other?: string;
    }
  | { questionId: string; type: "single"; status: "skipped"; value: null }
  | {
      questionId: string;
      type: "multiple";
      status: "answered";
      value: string[];
      other?: string;
    }
  | { questionId: string; type: "multiple"; status: "skipped"; value: [] }
>;

function isQuestionAnswered(
  question: RegisteredQuestion,
  answer: QuestionAnswerState | undefined,
): boolean {
  if (!answer) return false;
  if (answer.status === "skipped") return false;

  if (question.type === "single") {
    if (answer.value === QUESTION_OTHER_VALUE) {
      return Boolean(answer.other?.trim());
    }
    return Boolean(answer.value);
  }

  return answer.value.length > 0 || Boolean(answer.other?.trim());
}

function buildSubmission(
  questions: RegisteredQuestion[],
  answers: Record<string, QuestionAnswerState>,
): QuestionsSubmission {
  return questions.map((question) => {
    const answer = answers[question.id];

    if (!answer || answer.status === "skipped") {
      if (question.type === "single") {
        return {
          questionId: question.id,
          type: "single",
          status: "skipped",
          value: null,
        };
      }
      return {
        questionId: question.id,
        type: "multiple",
        status: "skipped",
        value: [],
      };
    }

    if (question.type === "single" && answer.type === "single") {
      return {
        questionId: question.id,
        type: "single",
        status: "answered",
        value: answer.value,
        ...(answer.other ? { other: answer.other } : {}),
      };
    }

    if (question.type === "multiple" && answer.type === "multiple") {
      return {
        questionId: question.id,
        type: "multiple",
        status: "answered",
        value: answer.value,
        ...(answer.other ? { other: answer.other } : {}),
      };
    }

    if (question.type === "single") {
      return {
        questionId: question.id,
        type: "single",
        status: "skipped",
        value: null,
      };
    }

    return {
      questionId: question.id,
      type: "multiple",
      status: "skipped",
      value: [],
    };
  });
}

function createQuestionsMapFromItems(
  items: QuestionInput[],
): Map<string, RegisteredQuestion> {
  const map = new Map<string, RegisteredQuestion>();
  items.forEach((item, index) => {
    map.set(item.id, {
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      required: item.required ?? false,
      allowOther: item.allowOther ?? true,
      index,
    });
  });
  return map;
}

function isSameRegisteredQuestion(
  a: RegisteredQuestion,
  b: RegisteredQuestion,
): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.prompt === b.prompt &&
    a.required === b.required &&
    a.allowOther === b.allowOther &&
    a.index === b.index
  );
}

type QuestionsRootContextValue = {
  questions: RegisteredQuestion[];
  registerQuestion: (question: RegisteredQuestion) => () => void;
  index: number;
  setIndex: (index: number) => void;
  answers: Record<string, QuestionAnswerState>;
  setAnswer: (questionId: string, answer: QuestionAnswerState) => void;
  markSkipped: (questionId: string) => void;
  selectSingle: (
    questionId: string,
    value: string,
    other?: string,
    options?: { autoAdvance?: boolean },
  ) => void;
  toggleMultiple: (questionId: string, value: string) => void;
  setMultipleOther: (questionId: string, other: string) => void;
  skip: () => void;
  submit: () => void;
  goNext: () => void;
  goPrev: () => void;
  canSkip: boolean;
  canSubmit: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  carouselApi: CarouselApi | null;
  setCarouselApi: (api: CarouselApi | undefined) => void;
  carouselCurrent: number;
  carouselCount: number;
  onDismiss?: () => void;
};

const QuestionsRootContext =
  React.createContext<QuestionsRootContextValue | null>(null);

const QuestionsSlideContext = React.createContext<{ index: number } | null>(
  null,
);

const QuestionContext = React.createContext<RegisteredQuestion | null>(null);

type QuestionOptionsContextValue = {
  type: QuestionType;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  isFocused: boolean;
  registerActivator: (index: number, activate: () => void) => () => void;
};

const QuestionOptionsContext =
  React.createContext<QuestionOptionsContextValue | null>(null);

function useQuestionsRoot(component: string): QuestionsRootContextValue {
  const ctx = React.useContext(QuestionsRootContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Questions`);
  }
  return ctx;
}

function useQuestion(component: string): RegisteredQuestion {
  const ctx = React.useContext(QuestionContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Question`);
  }
  return ctx;
}

function useQuestionOptions(component: string): QuestionOptionsContextValue {
  const ctx = React.useContext(QuestionOptionsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within QuestionOptions`);
  }
  return ctx;
}

export type QuestionsProps = React.ComponentProps<typeof Card> & {
  items?: QuestionInput[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  value?: Record<string, QuestionAnswerState>;
  defaultValue?: Record<string, QuestionAnswerState>;
  onValueChange?: (value: Record<string, QuestionAnswerState>) => void;
  onSubmit?: (submission: QuestionsSubmission) => void;
  onSkip?: (questionId: string) => void;
  onDismiss?: () => void;
};

function Questions({
  className,
  items,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  onSubmit,
  onSkip,
  onDismiss,
  children,
  ...props
}: QuestionsProps) {
  const itemsQuestionsMap = React.useMemo(
    () => (items ? createQuestionsMapFromItems(items) : null),
    [items],
  );
  const [registeredQuestionsMap, setRegisteredQuestionsMap] = React.useState<
    Map<string, RegisteredQuestion>
  >(() => new Map());
  const [internalIndex, setInternalIndex] = React.useState(defaultIndex);
  const [internalAnswers, setInternalAnswers] = React.useState<
    Record<string, QuestionAnswerState>
  >(defaultValue ?? {});
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null,
  );
  const [, setCarouselVersion] = React.useState(0);

  const isIndexControlled = indexProp !== undefined;
  const index = isIndexControlled ? indexProp : internalIndex;

  const isAnswersControlled = valueProp !== undefined;
  const answers = isAnswersControlled ? valueProp : internalAnswers;

  const setAnswers = React.useCallback(
    (
      updater:
        | Record<string, QuestionAnswerState>
        | ((
            prev: Record<string, QuestionAnswerState>,
          ) => Record<string, QuestionAnswerState>),
    ) => {
      if (isAnswersControlled) {
        const next =
          typeof updater === "function" ? updater(answers) : updater;
        onValueChange?.(next);
        return;
      }

      setInternalAnswers((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : updater;
        onValueChange?.(next);
        return next;
      });
    },
    [answers, isAnswersControlled, onValueChange],
  );

  const setIndex = React.useCallback(
    (nextIndex: number) => {
      if (!isIndexControlled) {
        setInternalIndex(nextIndex);
      }
      onIndexChange?.(nextIndex);
    },
    [isIndexControlled, onIndexChange],
  );

  const questions = React.useMemo(() => {
    const map = itemsQuestionsMap ?? registeredQuestionsMap;
    return Array.from(map.values()).sort((a, b) => a.index - b.index);
  }, [itemsQuestionsMap, registeredQuestionsMap]);

  const registerQuestion = React.useCallback(
    (question: RegisteredQuestion) => {
      if (itemsQuestionsMap) {
        return () => {};
      }

      setRegisteredQuestionsMap((prev) => {
        const existing = prev.get(question.id);
        if (existing && isSameRegisteredQuestion(existing, question)) {
          return prev;
        }
        const next = new Map(prev);
        next.set(question.id, question);
        return next;
      });
      return () => {
        setRegisteredQuestionsMap((prev) => {
          if (!prev.has(question.id)) return prev;
          const next = new Map(prev);
          next.delete(question.id);
          return next;
        });
      };
    },
    [itemsQuestionsMap],
  );

  const questionCount = questions.length;
  const clampedIndex =
    questionCount === 0
      ? 0
      : Math.min(Math.max(0, index), questionCount - 1);
  const currentQuestion = questions[clampedIndex] ?? null;
  const isLastQuestion =
    questionCount === 0 || clampedIndex >= questionCount - 1;

  const getQuestionById = React.useCallback(
    (questionId: string) => questions.find((q) => q.id === questionId),
    [questions],
  );

  const markSkipped = React.useCallback(
    (questionId: string) => {
      setAnswers((prev) => {
        const question = getQuestionById(questionId);
        if (!question) return prev;

        const existing = prev[questionId];
        if (existing && isQuestionAnswered(question, existing)) {
          return prev;
        }

        return {
          ...prev,
          [questionId]:
            question.type === "single"
              ? { type: "single", status: "skipped", value: null }
              : { type: "multiple", status: "skipped", value: [] },
        };
      });
    },
    [getQuestionById, setAnswers],
  );

  const setAnswer = React.useCallback(
    (questionId: string, answer: QuestionAnswerState) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    },
    [setAnswers],
  );

  const maybeSkipCurrent = React.useCallback(
    (question: RegisteredQuestion | null) => {
      if (!question) return;
      const answer = answers[question.id];
      if (!isQuestionAnswered(question, answer)) {
        markSkipped(question.id);
      }
    },
    [answers, markSkipped],
  );

  const goToIndex = React.useCallback(
    (nextIndex: number) => {
      if (questionCount === 0) return;
      const target = Math.min(Math.max(0, nextIndex), questionCount - 1);
      setIndex(target);
      carouselApi?.scrollTo(target);
    },
    [carouselApi, questionCount, setIndex],
  );

  const selectSingle = React.useCallback(
    (
      questionId: string,
      value: string,
      other?: string,
      options?: { autoAdvance?: boolean },
    ) => {
      setAnswer(questionId, {
        type: "single",
        status: "answered",
        value,
        ...(other ? { other } : {}),
      });

      if (options?.autoAdvance === false) return;

      const questionIndex = questions.findIndex((q) => q.id === questionId);
      if (questionIndex < 0 || questionIndex >= questions.length - 1) return;
      goToIndex(questionIndex + 1);
    },
    [goToIndex, questions, setAnswer],
  );

  const toggleMultiple = React.useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const existing = prev[questionId];
        const currentValues =
          existing?.type === "multiple" && existing.status === "answered"
            ? existing.value
            : [];
        const nextValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];

        return {
          ...prev,
          [questionId]: {
            type: "multiple",
            status: "answered",
            value: nextValues,
            ...(existing?.type === "multiple" &&
            existing.status === "answered" &&
            existing.other
              ? { other: existing.other }
              : {}),
          },
        };
      });
    },
    [setAnswers],
  );

  const setMultipleOther = React.useCallback(
    (questionId: string, other: string) => {
      setAnswers((prev) => {
        const existing = prev[questionId];
        const currentValues =
          existing?.type === "multiple" && existing.status === "answered"
            ? existing.value
            : [];

        return {
          ...prev,
          [questionId]: {
            type: "multiple",
            status: "answered",
            value: currentValues,
            other,
          },
        };
      });
    },
    [setAnswers],
  );

  const goNext = React.useCallback(() => {
    const current = questions[clampedIndex];
    if (!current) return;
    if (current.required && !isQuestionAnswered(current, answers[current.id])) {
      return;
    }
    maybeSkipCurrent(current);
    if (clampedIndex < questionCount - 1) {
      goToIndex(clampedIndex + 1);
    }
  }, [
    answers,
    clampedIndex,
    goToIndex,
    maybeSkipCurrent,
    questionCount,
    questions,
  ]);

  const goPrev = React.useCallback(() => {
    if (clampedIndex > 0) {
      goToIndex(clampedIndex - 1);
    }
  }, [clampedIndex, goToIndex]);

  const skip = React.useCallback(() => {
    const current = questions[clampedIndex];
    if (!current || isLastQuestion) return;
    if (current.required && !isQuestionAnswered(current, answers[current.id])) {
      return;
    }
    markSkipped(current.id);
    onSkip?.(current.id);
    goToIndex(clampedIndex + 1);
  }, [
    answers,
    clampedIndex,
    goToIndex,
    isLastQuestion,
    markSkipped,
    onSkip,
    questions,
  ]);

  const submit = React.useCallback(() => {
    const allQuestionsAnswered =
      questions.length > 0 &&
      questions.every((q) => isQuestionAnswered(q, answers[q.id]));

    if (!allQuestionsAnswered) return;

    onSubmit?.(buildSubmission(questions, answers));
  }, [answers, onSubmit, questions]);

  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap();
      const oldIndex = carouselApi.previousScrollSnap();
      if (newIndex === oldIndex) return;

      const oldQuestion = questions[oldIndex];
      if (newIndex > oldIndex && oldQuestion) {
        if (
          oldQuestion.required &&
          !isQuestionAnswered(oldQuestion, answers[oldQuestion.id])
        ) {
          carouselApi.scrollTo(oldIndex);
          return;
        }
        maybeSkipCurrent(oldQuestion);
      }

      setIndex(newIndex);
      setCarouselVersion((v) => v + 1);
    };

    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [answers, carouselApi, maybeSkipCurrent, questions, setIndex]);

  React.useEffect(() => {
    if (!carouselApi) return;
    if (carouselApi.selectedScrollSnap() !== clampedIndex) {
      carouselApi.scrollTo(clampedIndex);
    }
  }, [carouselApi, clampedIndex]);

  const currentAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion, answers[currentQuestion.id])
    : false;

  const canSkip =
    !isLastQuestion &&
    Boolean(currentQuestion) &&
    !(currentQuestion?.required && !currentAnswered);

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every((q) => isQuestionAnswered(q, answers[q.id]));

  const canSubmit = allQuestionsAnswered;
  const canGoPrev = clampedIndex > 0;
  const canGoNext =
    !isLastQuestion &&
    Boolean(currentQuestion) &&
    !(currentQuestion?.required && !currentAnswered);

  const carouselCount = carouselApi?.scrollSnapList().length ?? questionCount;
  const carouselCurrent =
    questionCount === 0 ? 0 : Math.min(clampedIndex + 1, questionCount);

  const setCarouselApiCb = React.useCallback(
    (api: CarouselApi | undefined) => {
      setCarouselApi(api ?? null);
    },
    [],
  );

  const rootValue = React.useMemo<QuestionsRootContextValue>(
    () => ({
      questions,
      registerQuestion,
      index: clampedIndex,
      setIndex: goToIndex,
      answers,
      setAnswer,
      markSkipped,
      selectSingle,
      toggleMultiple,
      setMultipleOther,
      skip,
      submit,
      goNext,
      goPrev,
      canSkip,
      canSubmit,
      canGoPrev,
      canGoNext,
      isLastQuestion,
      carouselApi,
      setCarouselApi: setCarouselApiCb,
      carouselCurrent,
      carouselCount,
      onDismiss,
    }),
    [
      answers,
      canGoNext,
      canGoPrev,
      canSkip,
      canSubmit,
      carouselApi,
      carouselCount,
      carouselCurrent,
      clampedIndex,
      goNext,
      goPrev,
      goToIndex,
      isLastQuestion,
      markSkipped,
      onDismiss,
      questions,
      registerQuestion,
      selectSingle,
      setAnswer,
      setCarouselApiCb,
      setMultipleOther,
      skip,
      submit,
      toggleMultiple,
    ],
  );

  return (
    <QuestionsRootContext.Provider value={rootValue}>
      <Card
        data-slot="questions"
        className={cn(
          "mx-auto w-full max-w-xl gap-0 rounded-3xl px-1 pt-4 pb-1! shadow-none shadow-border/50 dark:border-accent dark:shadow-background/50",
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    </QuestionsRootContext.Provider>
  );
}

export type QuestionProps = {
  id: string;
  type: QuestionType;
  prompt: React.ReactNode;
  required?: boolean;
  allowOther?: boolean;
  index?: number;
  children?: React.ReactNode;
};

function Question({
  id,
  type,
  prompt,
  required = false,
  allowOther = true,
  index: indexProp,
  children,
}: QuestionProps) {
  const root = useQuestionsRoot("Question");
  const slide = React.useContext(QuestionsSlideContext);
  const index = indexProp ?? slide?.index ?? 0;

  const meta = React.useMemo<RegisteredQuestion>(
    () => ({ id, type, prompt, required, allowOther, index }),
    [allowOther, id, index, prompt, required, type],
  );

  const { registerQuestion } = root;

  React.useLayoutEffect(() => {
    return registerQuestion(meta);
  }, [meta, registerQuestion]);

  return (
    <QuestionContext.Provider value={meta}>{children}</QuestionContext.Provider>
  );
}

const questionOptionsListClassName =
  "flex w-full flex-col gap-0 [&>*+*]:relative [&>*+*]:before:pointer-events-none [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:right-2.5 [&>*+*]:before:left-2.5 [&>*+*]:before:z-10 [&>*+*]:before:h-px [&>*+*]:before:bg-border/20 [&>*+*]:before:content-['']";

const questionRowClassName =
  "group/row flex h-11 w-full items-center gap-2.5 rounded-lg bg-transparent px-2.5 text-left transition-all hover:bg-muted active:scale-99";

export type QuestionOptionsProps = React.HTMLAttributes<HTMLDivElement>;

function QuestionOptions({ className, children, ...props }: QuestionOptionsProps) {
  const question = useQuestion("QuestionOptions");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);
  const activatorsRef = React.useRef<Map<number, () => void>>(new Map());

  const registerActivator = React.useCallback(
    (optionIndex: number, activate: () => void) => {
      activatorsRef.current.set(optionIndex, activate);
      return () => {
        activatorsRef.current.delete(optionIndex);
      };
    },
    [],
  );

  const childCount = React.Children.count(children);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (childCount === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, childCount - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      activatorsRef.current.get(activeIndex)?.();
    }
  };

  const optionsValue = React.useMemo<QuestionOptionsContextValue>(
    () => ({
      type: question.type,
      activeIndex,
      setActiveIndex,
      isFocused,
      registerActivator,
    }),
    [activeIndex, isFocused, question.type, registerActivator],
  );

  return (
    <QuestionOptionsContext.Provider value={optionsValue}>
      <div
        data-slot="question-options"
        role={question.type === "single" ? "listbox" : "group"}
        aria-label={typeof question.prompt === "string" ? question.prompt : undefined}
        aria-activedescendant={
          isFocused ? `question-option-${question.id}-${activeIndex}` : undefined
        }
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget as Node | null,
            )
          ) {
            setIsFocused(false);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(questionOptionsListClassName, className)}
        {...props}
      >
        {React.Children.map(children, (child, optionIndex) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(
            child as React.ReactElement<{ optionIndex?: number }>,
            { optionIndex },
          );
        })}
      </div>
    </QuestionOptionsContext.Provider>
  );
}

export type QuestionOptionProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value"
> & {
  value: string;
  optionIndex?: number;
  children?: React.ReactNode;
};

function QuestionOption({
  value,
  optionIndex = 0,
  className,
  children,
  onClick,
  ...props
}: QuestionOptionProps) {
  const question = useQuestion("QuestionOption");
  const root = useQuestionsRoot("QuestionOption");
  const options = useQuestionOptions("QuestionOption");
  const answer = root.answers[question.id];
  const displayIndex = optionIndex + 1;
  const isKeyboardActive =
    options.isFocused && options.activeIndex === optionIndex;

  const isSelected =
    question.type === "single"
      ? answer?.type === "single" &&
        answer.status === "answered" &&
        answer.value === value
      : answer?.type === "multiple" &&
        answer.status === "answered" &&
        answer.value.includes(value);

  const handleSelect = React.useCallback(() => {
    if (question.type === "single") {
      root.selectSingle(question.id, value);
      return;
    }
    root.toggleMultiple(question.id, value);
  }, [question.id, question.type, root, value]);

  React.useEffect(() => {
    return options.registerActivator(optionIndex, handleSelect);
  }, [handleSelect, optionIndex, options]);

  if (question.type === "multiple") {
    return (
      <label
        id={`question-option-${question.id}-${optionIndex}`}
        data-slot="question-option"
        data-active={isKeyboardActive}
        className={cn(
          questionRowClassName,
          "cursor-pointer",
          isKeyboardActive && "bg-muted",
          isSelected && "bg-muted",
          className,
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleSelect()}
          className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50"
        />
        <span className="min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary">
          {children}
        </span>
      </label>
    );
  }

  return (
    <button
      type="button"
      role="option"
      id={`question-option-${question.id}-${optionIndex}`}
      aria-selected={isSelected}
      tabIndex={-1}
      data-slot="question-option"
      data-active={isKeyboardActive}
      className={cn(
        questionRowClassName,
        "cursor-pointer",
        isKeyboardActive && "bg-muted",
        isSelected && "bg-muted",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        handleSelect();
      }}
      {...props}
    >
      <span
        className={cn(
          "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70",
          isSelected && "bg-border/70",
        )}
      >
        <span
          className={cn(
            "text-sm text-muted-foreground transition-all group-hover/row:text-primary",
            isSelected && "text-primary",
          )}
        >
          {displayIndex}
        </span>
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm text-ring transition-all group-hover/row:text-primary",
          isSelected && "text-primary",
        )}
      >
        {children}
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={2.0}
        className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
      />
    </button>
  );
}

export type QuestionOtherProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  optionIndex?: number;
};

function QuestionOther({
  optionIndex = 0,
  className,
  placeholder = "Other...",
  onKeyDown,
  ...props
}: QuestionOtherProps) {
  const question = useQuestion("QuestionOther");
  const root = useQuestionsRoot("QuestionOther");
  const options = useQuestionOptions("QuestionOther");
  const answer = root.answers[question.id];
  const isKeyboardActive =
    options.isFocused && options.activeIndex === optionIndex;

  const otherValue =
    answer?.status === "answered" && "other" in answer
      ? (answer.other ?? "")
      : "";

  const isOtherSelected =
    question.type === "single"
      ? answer?.type === "single" &&
        answer.status === "answered" &&
        answer.value === QUESTION_OTHER_VALUE
      : answer?.type === "multiple" &&
        answer.status === "answered" &&
        (answer.value.includes(QUESTION_OTHER_VALUE) ||
          Boolean(answer.other?.trim()));

  const handleSelect = React.useCallback(() => {
    if (question.type === "single") {
      if (otherValue.trim()) {
        root.selectSingle(question.id, QUESTION_OTHER_VALUE, otherValue.trim());
      }
      return;
    }
    root.toggleMultiple(question.id, QUESTION_OTHER_VALUE);
  }, [otherValue, question.id, question.type, root]);

  React.useEffect(() => {
    return options.registerActivator(optionIndex, handleSelect);
  }, [handleSelect, optionIndex, options]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (question.type === "single") {
      if (next.trim()) {
        root.selectSingle(question.id, QUESTION_OTHER_VALUE, next, {
          autoAdvance: false,
        });
      } else {
        root.markSkipped(question.id);
      }
      return;
    }
    root.setMultipleOther(question.id, next);
    if (next.trim() && !isOtherSelected) {
      root.toggleMultiple(question.id, QUESTION_OTHER_VALUE);
    }
  };

  if (question.type === "multiple") {
    return (
      <label
        id={`question-option-${question.id}-${optionIndex}`}
        data-slot="question-other"
        data-active={isKeyboardActive}
        className={cn(
          questionRowClassName,
          "cursor-text",
          isKeyboardActive && "bg-muted",
          className,
        )}
      >
        <Checkbox
          checked={isOtherSelected}
          onCheckedChange={() => handleSelect()}
          className="mx-1.25 size-4.5 shadow-none transition-colors group-hover/row:data-[state=unchecked]:border-ring/50"
        />
        <input
          type="text"
          value={otherValue}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          className="text-primary h-full min-w-0 flex-1 truncate text-sm transition-all outline-none placeholder:text-ring/70"
          {...props}
        />
      </label>
    );
  }

  return (
    <div
      id={`question-option-${question.id}-${optionIndex}`}
      data-slot="question-other"
      data-active={isKeyboardActive}
      className={cn(
        questionRowClassName,
        "cursor-text",
        isKeyboardActive && "bg-muted",
        className,
      )}
    >
      <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-border/30 transition-all group-hover/row:bg-border/70">
        <HugeiconsIcon
          icon={Edit03Icon}
          strokeWidth={2.0}
          className="size-4 text-muted-foreground transition-all group-hover/row:text-primary"
        />
      </span>
      <input
        type="text"
        role="option"
        aria-selected={isOtherSelected}
        value={otherValue}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className="text-primary h-full min-w-0 flex-1 truncate text-sm transition-all outline-none placeholder:text-ring"
        {...props}
      />
    </div>
  );
}

export type QuestionsTitleProps = React.ComponentProps<typeof CardTitle>;

function QuestionsTitle({ className, children, ...props }: QuestionsTitleProps) {
  const root = useQuestionsRoot("QuestionsTitle");
  const current = root.questions[root.index];

  return (
    <CardTitle
      data-slot="questions-title"
      className={cn("flex-1 text-sm font-normal", className)}
      {...props}
    >
      {children ?? current?.prompt}
    </CardTitle>
  );
}

export type QuestionsDismissProps = React.ComponentProps<typeof Button>;

function QuestionsDismiss({ className, onClick, ...props }: QuestionsDismissProps) {
  const root = useQuestionsRoot("QuestionsDismiss");

  return (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      data-slot="questions-dismiss"
      className={cn(
        "cursor-pointer rounded-full bg-transparent text-[13px] text-muted-foreground backdrop-blur-lg hover:bg-secondary/80 active:scale-97",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        root.onDismiss?.();
      }}
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.0} className="size-3.5" />
    </Button>
  );
}

export type QuestionsHeaderProps = React.ComponentProps<typeof CardHeader>;

function QuestionsHeader({ className, ...props }: QuestionsHeaderProps) {
  return (
    <CardHeader
      data-slot="questions-header"
      className={cn(
        "flex w-full items-center justify-center gap-2.5 pr-3 pb-1.5 pl-4",
        className,
      )}
      {...props}
    />
  );
}

export type QuestionsFooterProps = React.ComponentProps<typeof CardFooter>;

function QuestionsFooter({ className, ...props }: QuestionsFooterProps) {
  return (
    <CardFooter
      data-slot="questions-footer"
      className={cn(
        "justify-end gap-2 border-none bg-transparent px-3 pt-0 pb-3",
        className,
      )}
      {...props}
    />
  );
}

export type QuestionsSkipProps = React.ComponentProps<typeof Button>;

function QuestionsSkip({ className, disabled, onClick, ...props }: QuestionsSkipProps) {
  const root = useQuestionsRoot("QuestionsSkip");

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="questions-skip"
      disabled={disabled ?? !root.canSkip}
      className={cn(
        "text-muted-foreground hover:text-primary active:scale-99",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        root.skip();
      }}
      {...props}
    >
      Skip
    </Button>
  );
}

export type QuestionsSubmitProps = React.ComponentProps<typeof Button>;

function QuestionsSubmit({
  className,
  disabled,
  onClick,
  children = "Submit",
  ...props
}: QuestionsSubmitProps) {
  const root = useQuestionsRoot("QuestionsSubmit");

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      data-slot="questions-submit"
      disabled={disabled ?? !root.canSubmit}
      className={cn("active:scale-99", className)}
      onClick={(event) => {
        onClick?.(event);
        root.submit();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

function useCarouselViewportHeight(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  carouselApi: CarouselApi | null,
  activeIndex: number,
) {
  React.useLayoutEffect(() => {
    const vp = wrapRef.current?.querySelector<HTMLElement>(
      "[data-slot=carousel-content]",
    );
    if (!vp) return;
    const clear = () => {
      vp.style.height = "";
      vp.style.transition = "";
    };
    if (!carouselApi) return clear();
    vp.style.transition = "height 500ms ease-out";
    const sync = () => {
      const h = carouselApi.slideNodes()[activeIndex]?.offsetHeight ?? 0;
      vp.style.height = h > 0 ? `${h}px` : "";
    };
    sync();
    const slide = carouselApi.slideNodes()[activeIndex];
    if (!slide) return clear;
    const ro = new ResizeObserver(sync);
    ro.observe(slide);
    return () => {
      ro.disconnect();
      clear();
    };
  }, [wrapRef, carouselApi, activeIndex]);
}

export type QuestionsCarouselProps = React.ComponentProps<typeof Carousel>;

function QuestionsCarousel({
  setApi: setApiProp,
  className,
  children,
  ...props
}: QuestionsCarouselProps) {
  const root = useQuestionsRoot("QuestionsCarousel");

  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-slot="question-options"]')) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      root.goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      root.goNext();
    }
  };

  return (
    <div onKeyDownCapture={handleKeyDownCapture} className="contents">
      <Carousel
        data-slot="questions-carousel"
        className={className}
        setApi={(api) => {
          root.setCarouselApi(api);
          setApiProp?.(api);
        }}
        opts={{ watchDrag: false }}
        {...props}
      >
        {children}
      </Carousel>
    </div>
  );
}

export type QuestionsCarouselHeaderProps = React.ComponentProps<typeof CardHeader>;

function QuestionsCarouselHeader({
  className,
  ...props
}: QuestionsCarouselHeaderProps) {
  return (
    <CardHeader
      data-slot="questions-carousel-header"
      className={cn(
        "flex w-full items-center justify-center gap-2.5 pr-3 pb-1.5 pl-4",
        className,
      )}
      {...props}
    />
  );
}

export type QuestionsCarouselContentProps = React.ComponentProps<
  typeof CarouselContent
>;

function QuestionsCarouselContent({
  className,
  ...props
}: QuestionsCarouselContentProps) {
  const root = useQuestionsRoot("QuestionsCarouselContent");
  const wrapRef = React.useRef<HTMLDivElement>(null);
  useCarouselViewportHeight(wrapRef, root.carouselApi, root.index);

  return (
    <div ref={wrapRef} className="contents">
      <CarouselContent
        data-slot="questions-carousel-content"
        className={className}
        {...props}
      />
    </div>
  );
}

export type QuestionsCarouselItemProps = React.ComponentProps<
  typeof CarouselItem
> & {
  index: number;
};

function QuestionsCarouselItem({
  index,
  className,
  children,
  ...props
}: QuestionsCarouselItemProps) {
  return (
    <CarouselItem
      data-slot="questions-carousel-item"
      className={cn("w-full self-start p-0 pl-0", className)}
      {...props}
    >
      <QuestionsSlideContext.Provider value={{ index }}>
        <CardContent className="w-full p-1.5">{children}</CardContent>
      </QuestionsSlideContext.Provider>
    </CarouselItem>
  );
}

export type QuestionsCarouselPaginationProps = React.HTMLAttributes<HTMLDivElement>;

function QuestionsCarouselPagination({
  className,
  ...props
}: QuestionsCarouselPaginationProps) {
  return (
    <div
      data-slot="questions-carousel-pagination"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

export type QuestionsCarouselNavButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

function QuestionsCarouselPrev({
  className,
  children,
  ...props
}: QuestionsCarouselNavButtonProps) {
  const root = useQuestionsRoot("QuestionsCarouselPrev");

  return (
    <button
      type="button"
      data-slot="questions-carousel-prev"
      disabled={!root.canGoPrev}
      className={cn(
        "flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-97 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50",
        className,
      )}
      onClick={() => root.goPrev()}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
      )}
    </button>
  );
}

function QuestionsCarouselNext({
  className,
  children,
  ...props
}: QuestionsCarouselNavButtonProps) {
  const root = useQuestionsRoot("QuestionsCarouselNext");

  return (
    <button
      type="button"
      data-slot="questions-carousel-next"
      disabled={!root.canGoNext}
      className={cn(
        "flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-97 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50",
        className,
      )}
      onClick={() => root.goNext()}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
      )}
    </button>
  );
}

export type QuestionsCarouselIndexProps = React.HTMLAttributes<HTMLSpanElement> & {
  format?: "of" | "slash";
};

function QuestionsCarouselIndex({
  className,
  format = "of",
  ...props
}: QuestionsCarouselIndexProps) {
  const root = useQuestionsRoot("QuestionsCarouselIndex");

  return (
    <span
      data-slot="questions-carousel-index"
      className={cn(
        "text-xs leading-4.5 font-[350] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    >
      {format === "slash"
        ? `${root.carouselCurrent}/${root.carouselCount}`
        : `${root.carouselCurrent} of ${root.carouselCount}`}
    </span>
  );
}

export {
  Questions,
  Question,
  QuestionOptions,
  QuestionOption,
  QuestionOther,
  QuestionsTitle,
  QuestionsDismiss,
  QuestionsHeader,
  QuestionsFooter,
  QuestionsSkip,
  QuestionsSubmit,
  QuestionsCarousel,
  QuestionsCarouselHeader,
  QuestionsCarouselContent,
  QuestionsCarouselItem,
  QuestionsCarouselPagination,
  QuestionsCarouselPrev,
  QuestionsCarouselNext,
  QuestionsCarouselIndex,
};
