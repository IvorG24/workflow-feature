import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const jiraConfig = {
      user: process.env.JIRA_USER,
      api_token: process.env.JIRA_API_TOKEN,
      api_url: process.env.JIRA_API_URL,
    };

    if (!jiraConfig.user || !jiraConfig.api_token || !jiraConfig.api_url) {
      return res.status(400).json({ error: "Jira env variables undefined" });
    }

    const response = await fetch(
      `${jiraConfig.api_url}user/search?query=${req.query.approverEmail}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return res.status(200).json(responseData);
    } else {
      console.error(await response.text());
      return null;
    }
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}
