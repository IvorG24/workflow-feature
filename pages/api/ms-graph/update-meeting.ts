import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (
      !process.env.MS_GRAPH_CLIENT_ID ||
      !process.env.MS_GRAPH_CLIENT_SECRET ||
      !process.env.MS_GRAPH_TENANT_ID
    ) {
      return res.status(405).json({ error: "Missing required credentials" });
    }

    const { access_token, meeting_details, meeting_id } = req.body;

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/dev@staclara.com.ph/events/${meeting_id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meeting_details),
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Error creating OAuth token" });
  }
}
