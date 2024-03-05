import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const jiraConfig = {
      user: process.env.JIRA_USER,
      api_token: process.env.JIRA_API_TOKEN,
      api_url: process.env.JIRA_API_URL,
    };

    if (!jiraConfig.user || !jiraConfig.api_token || !jiraConfig.api_url) {
      return res.status(405).json({ error: "Jira env variables undefined" });
    }

    const { jiraTicketKey, transitionId } = req.body;

    const response = await fetch(
      `https://scic.atlassian.net/rest/api/3/issue/${jiraTicketKey}/transitions`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transition: { id: transitionId } }),
      }
    );

    if (response.status === 204) {
      return res.status(200).json({ success: true, error: null });
    } else {
      console.error(await response.text());
      return res
        .status(response.status)
        .json({ success: false, error: await response.text() });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
