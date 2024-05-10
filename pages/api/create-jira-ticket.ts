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

    const response = await fetch(
      `https://scic.atlassian.net/rest/servicedeskapi/request`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body.data),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      // add organization
      if (req.body.organizationId) {
        await fetch(`${jiraConfig.api_url}/issue/${responseData.issueKey}`, {
          method: "PUT",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${jiraConfig.user}:${jiraConfig.api_token}`
            ).toString("base64")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              customfield_10002: [req.body.organizationId],
            },
          }),
        });
      }

      return res.status(200).json(responseData);
    } else {
      console.error(await response.text());
      return res.status(response.status).json({ error: await response.text() });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
