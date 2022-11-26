import { QuestionRow } from "@/components/CreateRequestFormPage/type/FormModel";

const reorderByPriority = (questions: QuestionRow[], priority: number[]) => {
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

export default reorderByPriority;
