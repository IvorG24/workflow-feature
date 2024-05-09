import { Database } from "@/utils/database";
import { startCase } from "@/utils/string";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

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

    const response = await fetch(`${jiraConfig.api_url}/issue/${issueKey}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${jiraConfig.user}:${jiraConfig.api_token}`
        ).toString("base64")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const { fields } = await response.json();

    if (fields) {
      const jiraEmployeeFirstNameValue = fields["customfield_10380"];
      const jiraEmployeeLastNameValue = fields["customfield_10381"];
      const jiraEmployeeNumberValue = `${fields["customfield_10114"]}`; // sample value: 1054.0
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
              "Content-Type": "application/json",
            },
            body: JSON.stringify(commentBody),
          }
        );

        if (!jiraTicketCommentResponse.ok) {
          console.error("Failed to add comment");
          return res.status(404).json({ error: "Failed to add comment" });
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

      // reopen form
      const reopenFormResponse = await fetch(
        `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/${issueKey}/form/c48e2408-5379-4aa5-b707-60c6eef8f992/action/reopen`,
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
      );

      if (!reopenFormResponse.ok) {
        const updateTicketResponseData = await reopenFormResponse.json();
        return res.status(404).json({
          error: "Failed to reopen form",
          response: updateTicketResponseData,
        });
      }

      // update ticket
      const updateTicketResponse = await fetch(
        `${jiraConfig.api_url}/issue/${issueKey}`,
        {
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
        }
      );

      if (!updateTicketResponse.ok) {
        const updateTicketResponseData = await updateTicketResponse.json();
        return res.status(404).json({
          error: "Failed to update ticket",
          response: updateTicketResponseData,
        });
      }

      // submit form
      const submitFormResponse = await fetch(
        `https://api.atlassian.com/jira/forms/cloud/64381e1f-8232-47b7-92c4-caebc8a6d35a/issue/${issueKey}/form/c48e2408-5379-4aa5-b707-60c6eef8f992/action/submit`,
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
      );

      if (!submitFormResponse.ok) {
        const updateTicketResponseData = await submitFormResponse.json();
        return res.status(404).json({
          error: "Failed to submit form",
          response: updateTicketResponseData,
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
        console.error(jiraTicketCommentResponse);
        return res.status(404).json({
          error: "Failed to add comment",
          response: jiraTicketCommentResponse,
        });
      }

      return res
        .status(200)
        .json({ success: true, message: "Ticket updated." });
    } else {
      return res.status(404).json({ error: "Fields value not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
