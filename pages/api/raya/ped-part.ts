import { getPedPartRayaApi, validateEnvApiKey } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { limiter } from "@/utils/server-side-protections";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await new Promise((resolve, reject) => {
      limiter(req, res, (result: Error) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    });

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = createPagesServerClient<Database>({ req, res });
    const { authorization } = req.headers;

    const keyData = await validateEnvApiKey(supabase, {
      apiKey: authorization ?? "",
      endPoint: req.url ?? "",
    });

    const { offset, limit, startDate, endDate, order } = req.query as {
      offset?: string;
      limit?: string;
      startDate?: string;
      endDate?: string;
      order?: string;
    };

    const responseData = await getPedPartRayaApi(supabase, {
      offset,
      limit,
      order,
      teamId: keyData.team_key_team_id,
      startDate,
      endDate,
    });

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ error: `${error}` });
  }
}
