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
    console.log("UPDATE");
    const { answers, requestId, formData, approver } = req.body;
    const newAnswers = answers as (FieldRow & {
      response: string;
      responseId: number | null;
    })[];

    try {
      await supabase
        .from("request_table")
        .update({
          approver_id: approver,
          request_title: formData.title,
          on_behalf_of: formData.behalf,
          request_description: formData.description,
        })
        .eq("request_id", requestId);

      const requestResponseFieldList = newAnswers.map((field) => {
        return {
          field_id: Number(field.field_id),
          response_value: field.response,
          request_id: requestId,
        };
      });

      const { error } = await supabase
        .from("request_response_table")
        .upsert(requestResponseFieldList);

      if (error) throw error;
      res.status(200);
    } catch {
      res.status(500);
    }
  }
};

export default handler;
