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

    const formTemplateId = "46fdd3a0-be7d-4e81-838e-fda1aaa38402";
    const jiraTicketKey = req.query.jiraTicketKey;
    const apiUrl =
      "https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/";

    const createFormResponse = await fetch(`${apiUrl}${jiraTicketKey}/form`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${jiraConfig.user}:${jiraConfig.api_token}`
        ).toString("base64")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-ExperimentalApi": "opt-in",
      },
      body: JSON.stringify({ formTemplate: { id: formTemplateId } }),
    });

    if (!createFormResponse.ok) {
      console.error(await createFormResponse.text());
      return res.status(createFormResponse.status).json({
        error: "Failed to add form to your ticket. Please contact your IT.",
      });
    }

    const responseData = await createFormResponse.json();

    const submitFormResponse = await fetch(
      `${apiUrl}${jiraTicketKey}/form/${responseData.id}/action/submit`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "X-ExperimentalApi": "opt-in",
        },
      }
    );

    if (!submitFormResponse.ok) {
      console.error(await submitFormResponse.text());
      return res.status(submitFormResponse.status).json({
        error:
          "Your form request failed to submit. Please contact your IT to submit your form.",
      });
    }

    const changeFormVisibility = await fetch(
      `${apiUrl}${jiraTicketKey}/form/${responseData.id}/action/external`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "X-ExperimentalApi": "opt-in",
        },
      }
    );

    if (!changeFormVisibility.ok) {
      console.error(await submitFormResponse.text());
      return res.status(submitFormResponse.status).json({
        error:
          "Your jira ticket can not be viewed on the portal. Please contact your IT to change visibility to external.",
      });
    }

    return res.status(200).json(submitFormResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
