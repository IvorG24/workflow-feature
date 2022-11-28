import {
  OptionRow,
  QuestionOption,
  QuestionRow,
} from "@/components/CreateRequestFormPage/type";

export const alignQuestionOption = (
  questionRecord: QuestionRow[],
  options: QuestionOption[][]
) => {
  const questionWithOption: OptionRow[] = [];

  for (let i = 0; i < questionRecord.length; i++) {
    const questionIndex = questionRecord[i];

    const isMultipleOrSelect =
      questionIndex.expected_response_type === "multiple" ||
      questionIndex.expected_response_type === "select";

    if (isMultipleOrSelect) {
      questionWithOption.push({
        question_id: questionIndex.question_id as unknown as number,
        question_option: options[i].map((item) => item.value),
      });
    }
  }

  return questionWithOption.filter(Boolean);
};

export const reorderByPriority = (
  questions: QuestionRow[],
  priority: number[]
) => {
  const newQuestion = [];

  for (let i = 0; i < priority.length; i++) {
    const indexPriority = priority[i];
    const findQuestion = questions.find(
      (item) => item.question_id === indexPriority
    );
    newQuestion.push(findQuestion);
  }

  return newQuestion.filter(Boolean) as QuestionRow[];
};
