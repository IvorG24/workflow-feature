import { NextApiRequest, NextApiResponse } from "next";
import { Database } from "@/utils/database";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const { userId, preference } = JSON.parse(req.body);
    if (!userId || !preference) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const { data, error } = await supabase
      .schema("user_schema")
      .from("user_sidebar_preference_table")
      .upsert(
        {
          user_sidebar_preference_user_id: userId,
          user_sidebar_preference_metrics: preference.metrics,
          user_sidebar_preference_human_resources: preference.humanResources,
          user_sidebar_preference_create: preference.create,
          user_sidebar_preference_list: preference.list,
          user_sidebar_preference_form: preference.form,
          user_sidebar_preference_team: preference.team,
          user_sidebar_preference_jira: preference.jira,
        },
        {
          onConflict: "user_sidebar_preference_user_id",
          ignoreDuplicates: false,
        }
      )
      .select("*");
    if (error) throw error;
    return res.status(200).json({ message: "Success", data });
  } catch (error) {
    return res.status(500).json({ message: "Failed", error });
  }
}
