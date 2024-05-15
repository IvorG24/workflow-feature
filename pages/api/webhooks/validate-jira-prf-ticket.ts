import { Database } from "@/utils/database";
import { startCase } from "@/utils/string";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

// set timeout to 1 minute
export const config = {
  maxDuration: 60,
};

type CommentType = {
  type: string;
  text?: string;
};

const commentBodyTemplate = (content: CommentType[]) => {
  return {
    body: {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [...content],
        },
      ],
    },
  };
};

const commentScript = (changes: CommentType[]) => {
  return [
    {
      type: "text",
      text: "UPDATE INFO",
    },
    {
      type: "hardBreak",
    },
    ...changes,
    {
      type: "hardBreak",
    },
    {
      type: "text",
      text: "For your validation. Cancel the ticket if the updated info is incorrect and contact a Jira Administrator or HR Representative if you are unsure of their employee info.",
    },
  ];
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
      return res.status(400).json({ error: "Jira env variables undefined" });
    }

    const supabase = createPagesServerClient<Database>({ req, res });

    const { issueKey } = req.query;

    const [response, formIdResponse] = await Promise.all([
      fetch(`${jiraConfig.api_url}/issue/${issueKey}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      fetch(
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
      ),
    ]);

    const [responseData, formIdData] = await Promise.all([
      response.json(),
      formIdResponse.json(),
    ]);

    if (!responseData.fields) {
      return res.status(404).json({ error: "Fields value not found" });
    }

    const jiraEmployeeFirstNameValue = responseData.fields["customfield_10380"];
    const jiraEmployeeLastNameValue = responseData.fields["customfield_10381"];
    const jiraEmployeeNumberValue = `${responseData.fields["customfield_10114"]}`; // sample value: 1054.0

    if (jiraEmployeeNumberValue === "null") {
      return res.status(201).json({ error: "No update required." });
    }

    const employeeNumber = jiraEmployeeNumberValue.split(".")[0]; // split to remove decimals

    const { data, error } = await supabase
      .from("scic_employee_table")
      .select("*")
      .eq("scic_employee_hris_id_number", employeeNumber)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // add comment to jira ticket that id is not found
      const commentBody = commentBodyTemplate([
        {
          type: "text",
          text: "Employee ID number for validation of Jira Administrator and/or HR Representative.",
        },
      ]);
      const jiraTicketCommentResponse = await fetch(
        `${jiraConfig.api_url}/issue/${issueKey}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${jiraConfig.user}:${jiraConfig.api_token}`
            ).toString("base64")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commentBody),
        }
      );

      if (!jiraTicketCommentResponse.ok) {
        return res.status(400).json({
          error: "Failed to add comment",
          body: commentBody,
        });
      }
      return res.status(404).json({ error: "Employee ID not found." });
    }

    const { scic_employee_first_name, scic_employee_last_name } = data;

    const changes: CommentType[] = [
      {
        type: "text",
        text: `Employee Number: ${jiraEmployeeNumberValue}`,
      },
      {
        type: "hardBreak",
      },
    ];

    const invalidFirstName =
      scic_employee_first_name.toLowerCase() !==
      jiraEmployeeFirstNameValue.toLowerCase();
    const invalidLastName =
      scic_employee_last_name.toLowerCase() !==
      jiraEmployeeLastNameValue.toLowerCase();

    if (!invalidFirstName && !invalidLastName) {
      return res.status(201).json({
        message: "No update required.",
      });
    }

    if (invalidFirstName) {
      changes.push({
        type: "text",
        text: `First Name: old value - ${jiraEmployeeFirstNameValue}  ->  new value - ${scic_employee_first_name}`,
      });
      changes.push({
        type: "hardBreak",
      });
    }

    if (invalidLastName) {
      changes.push({
        type: "text",
        text: `Last Name: old value - ${jiraEmployeeLastNameValue}  ->  new value - ${scic_employee_last_name}`,
      });
      changes.push({
        type: "hardBreak",
      });
    }

    const formId = formIdData.value.forms[0].uuid;

    // parallelize remaining API requests to save execution time
    const [reopenFormResponse, updateTicketResponse, submitFormResponse] =
      await Promise.all([
        fetch(
          `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/${issueKey}/form/${formId}/action/reopen`,
          {
            method: "PUT",
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${jiraConfig.user}:${jiraConfig.api_token}`
              ).toString("base64")}`,
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-ExperimentalApi": "opt-in",
            },
          }
        ),
        fetch(`${jiraConfig.api_url}/issue/${issueKey}`, {
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
              customfield_10380: invalidFirstName
                ? startCase(scic_employee_first_name)
                : jiraEmployeeFirstNameValue,
              customfield_10381: invalidLastName
                ? startCase(scic_employee_last_name)
                : jiraEmployeeLastNameValue,
            },
          }),
        }),
        fetch(
          `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/${issueKey}/form/${formId}/action/submit`,
          {
            method: "PUT",
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${jiraConfig.user}:${jiraConfig.api_token}`
              ).toString("base64")}`,
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-ExperimentalApi": "opt-in",
            },
          }
        ),
      ]);

    // Handle errors for each parallel request
    if (!reopenFormResponse.ok) {
      const reopenFormResponseData = await reopenFormResponse.json();
      return res.status(404).json({
        error: "Failed to reopen form",
        response: reopenFormResponseData,
      });
    }

    if (!updateTicketResponse.ok) {
      const updateTicketResponseData = await updateTicketResponse.json();
      return res.status(404).json({
        error: "Failed to update ticket",
        response: updateTicketResponseData,
      });
    }

    if (!submitFormResponse.ok) {
      const submitFormResponseData = await submitFormResponse.json();
      return res.status(404).json({
        error: "Failed to submit form",
        response: submitFormResponseData,
      });
    }

    // add comment
    const commentContent = commentScript(changes);
    const commentBody = commentBodyTemplate(commentContent);

    const jiraTicketCommentResponse = await fetch(
      `${jiraConfig.api_url}/issue/${issueKey}/comment`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${jiraConfig.user}:${jiraConfig.api_token}`
          ).toString("base64")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentBody),
      }
    );

    if (!jiraTicketCommentResponse.ok) {
      return res.status(404).json({
        error: "Failed to add comment",
        response: jiraTicketCommentResponse,
      });
    }

    return res.status(200).json({ success: true, message: "Ticket updated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
