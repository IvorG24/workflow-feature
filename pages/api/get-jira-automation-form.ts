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

    const { serviceDeskId, requestType } = req.query;

    // https://developer.atlassian.com/cloud/forms/rest/api-group-forms-on-portal/#api-servicedesk-servicedeskid-requesttype-requesttypeid-form-get
    const response = await fetch(
      `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/servicedesk/${serviceDeskId}/requesttype/${requestType}/form/externaldata`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-ExperimentalApi": "opt-in",
        },
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return res.status(200).json(responseData);
    } else {
      console.error(await response.text());
      return res
        .status(response.status)
        .json({ error: "Error fetching data from Jira API" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
