import { Database } from "@/utils/database";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = createPagesServerClient<Database>({ req, res });

    const { data, error } = await supabase
      .schema("lookup_schema")
      .from("employee_job_title_table")
      .select("*");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
