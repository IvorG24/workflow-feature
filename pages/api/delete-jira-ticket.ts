import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const jiraConfig = {
      user: process.env.JIRA_USER,
      api_token: process.env.JIRA_API_TOKEN,
    };

    if (!jiraConfig.user || !jiraConfig.api_token) {
      return res.status(405).json({ error: "Jira env variables undefined" });
    }

    const { jiraId } = req.body;

    const response = await fetch(
      `https://your-domain.atlassian.net/rest/api/3/issueLink/${jiraId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
        },
      }
    );

    if (response.status === 201) {
      // Jira ticket was deleted successfully
      const responseData = await response.json();
      return res.status(200).json(responseData);
    } else {
      console.error(await response.text());
      return res
        .status(response.status)
        .json({ error: "Error deleting Jira ticket" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting Jira ticket" });
  }
}
