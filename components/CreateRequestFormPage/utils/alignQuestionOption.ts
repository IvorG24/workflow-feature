import {
  OptionRow,
  QuestionOption,
  QuestionRow,
} from "@/components/CreateRequestFormPage/type/FormModel";

const alignQuestionOption = (
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

export default alignQuestionOption;
