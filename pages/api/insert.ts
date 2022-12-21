import type { Database } from "@/utils/database.types";
import { FieldRow } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  });

  if (req.method === "POST") {
    console.log("INSERT");
    const { formData, formId, userId, approver, purchaser, answers } = req.body;
    const newAnswers = answers as (FieldRow & {
      response: string;
      responseId: number | null;
    })[];

    try {
      const { data: request, error: requestError } = await supabase
        .from("request_table")
        .insert({
          approver_id: approver,
          purchaser_id: purchaser,
          requested_by: userId,
          form_table_id: formId,
          request_title: formData.title,
          on_behalf_of: formData.behalf,
          request_description: formData.description,
          is_draft: true,
        })
        .select()
        .single();

      if (!request || requestError) throw requestError;

      const requestResponseList = newAnswers.map((response) => {
        return {
          field_id: Number(response.field_id),
          response_value: response.response,
          request_id: request.request_id,
        };
      });
      const { error: requestResponseError } = await supabase
        .from("request_response_table")
        .insert(requestResponseList);

      if (requestResponseError) throw requestResponseError;

      res.status(200);
    } catch (e) {
      console.log(e);
      res.status(500);
    }
  }
};

export default handler;
