import { NextApiRequest, NextApiResponse } from "next";

type FormAnswerType = {
  label: string;
  answer: string;
  choice: string;
};

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

    const { issueKey } = req.query;

    const formIdResponse = await fetch(
      ` https://scic.atlassian.net/rest/api/3/issue/${issueKey}/properties/proforma.forms`,
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

    const formIdData = await formIdResponse.json();
    const formId = formIdData.value.forms[0].uuid;

    const formAnswersResponse = await fetch(
      `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/${issueKey}/form/${formId}/format/answers`,
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

    const formAnswersData = await formAnswersResponse.json();

    if (!formAnswersResponse.ok) {
      console.error(formAnswersData);
      return res.status(500).json({ error: "Failed to fetch form answers" });
    }

    const positionFormField: FormAnswerType = formAnswersData.find(
      (answer: FormAnswerType) => answer.label === "Position"
    );

    if (!positionFormField) {
      console.error("Position form field not found.");
      return res.status(500).json({ error: "Position form field not found." });
    }

    const positionFormAnswer = positionFormField.answer;
    // update job title field
    const response = await fetch(`${jiraConfig.api_url}/issue/${issueKey}`, {
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
          customfield_10070: [positionFormAnswer],
        },
      }),
    });

    if (!response.ok) {
      console.log(await response.json());
      return res.status(500).json({ error: "Failed to update ticket." });
    }

    return res.status(200).json({ success: true, message: "Update success." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
