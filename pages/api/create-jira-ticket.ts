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
    };

    if (!jiraConfig.user || !jiraConfig.api_token) {
      return res.status(405).json({ error: "Jira env variables undefined" });
    }

    const { summary, description, project_key, issue_type_name } = req.body;

    const requestBody = {
      fields: {
        project: {
          key: project_key,
        },
        summary,
        description,
        issuetype: {
          name: issue_type_name,
        },
      },
    };

    const response = await fetch(
      // Jira Rest API
      "https://test-formsly.atlassian.net/rest/api/2/issue/",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.status === 201) {
      // Jira ticket was created successfully
      const responseData = await response.json();
      return res.status(200).json(responseData);
    } else {
      // Handle Jira API error, log response for debugging
      console.error(await response.text());
      return res
        .status(response.status)
        .json({ error: "Error creating Jira ticket" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating Jira ticket" });
  }
}
