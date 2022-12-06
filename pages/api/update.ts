import type { Database } from "@/utils/database.types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });

  if (req.method === "POST") {
    const { formData, approver, answers, requestId } = req.body;
    const newAnswers = answers as { questionId: string; value: string }[];

    newAnswers.map(async (answer) => {
      await supabase
        .from("form_table")
        .update({
          is_draft: true,
          response_value: [answer.value],
        })
        .eq("question_id", answer.questionId)
        .eq("request_id", requestId);
    });

    await supabase
      .from("form_table")
      .update({
        request_title: formData.title,
        request_description: formData.description,
        approver_id: approver,
        on_behalf_of: formData.behalf,
        is_draft: true,
      })
      .eq("request_id", requestId);

    res.status(200);
  }
};

export default handler;
