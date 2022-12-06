import type { Database } from "@/utils/database.types";
import { FormInsert } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });

  if (req.method === "POST") {

    const { formData, isDraft, formId, userId, approver, answers } = req.body;
    const newAnswers = answers as { questionId: string; value: string }[];

    const request = await supabase
      .from("request_table")
      .insert({})
      .select()
      .limit(1)
      .single();

    if (!request.data) throw new Error();

    await supabase.from("form_table").insert({
      form_name_id: Number(formId),
      team_id: null,
      request_title: formData.title,
      request_description: formData.description,
      on_behalf_of: formData.behalf,
      approver_id: approver,
      approval_status: "pending",
      response_owner: userId,
      request_id: Number(`${request.data.request_id}`),
      is_draft: isDraft,
    });

    const questionIdList = newAnswers.map((answer) =>
      Number(answer.questionId)
    );
    const answerList = newAnswers.map((answer) => answer.value);
    const form: FormInsert[] = saveToFormTable(
      Number(formId),
      questionIdList,
      userId,
      Number(`${request.data?.request_id}`),
      formData.title,
      formData.description,
      approver,
      formData.behalf,
      answerList,
      isDraft
    );

    await supabase.from("form_table").insert(form);

    res.status(200);
  }
};

const saveToFormTable = (
  form_name_id: number,
  questionIdList: number[],
  form_owner: string,
  request_id: number,
  title: string,
  description: string,
  approver: string,
  behalf: string,
  answerList: string[],
  isDraft: boolean
) => {
  const formTableRecord: FormInsert[] = [];

  for (let i = 0; i < questionIdList.length; i++) {
    const question_id = questionIdList[i];
    const answer = answerList[i];
    formTableRecord.push({
      question_id,
      request_id,
      form_name_id,
      form_owner,
      team_id: null,
      is_draft: isDraft,
      request_title: title,
      request_description: description,
      approver_id: approver,
      on_behalf_of: behalf,
      response_value: [answer],
    });
  }

  return formTableRecord;
};

export default handler;
