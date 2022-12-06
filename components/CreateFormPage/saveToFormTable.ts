import { FormTableInsert } from "./type";

export const saveToFormTable = (
  form_name_id: number,
  priority: number[],
  form_owner: string,
  description: string,
  team_id: string
) => {
  const formTableRecord: FormTableInsert[] = [];

  for (let i = 0; i < priority.length; i++) {
    const question_id = priority[i];
    formTableRecord.push({
      question_id,
      form_name_id,
      form_owner,
      // form_type: "review",
      request_description: description,
      team_id,
    });
  }

  return formTableRecord;
};
