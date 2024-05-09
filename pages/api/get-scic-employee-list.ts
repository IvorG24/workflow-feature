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

    // Retrieve the private key from the request headers
    const secretKey = req.query.apiKey;

    if (secretKey !== process.env.JIRA_WEBHOOK_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("scic_employee_table")
      .select("*");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
