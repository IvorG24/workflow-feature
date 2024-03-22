import { getCommentAttachment } from "@/backend/api/get";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { Database } from "./database";
import {
  generateJiraCommentPayload,
  generateJiraTicketPayload,
} from "./functions";
import { RequestCommentType } from "./types";

export type JiraTicketPayloadProps = {
  requestId: string;
  requestUrl: string;
  requestTypeId: string;
  projectName: string;
  itemCategory: string[];
};

export type JiraTicketData = {
  success: boolean;
  data: { jiraTicketKey: string; jiraTicketWebLink: string } | null;
};

export const createJiraTicket = async (
  initialJiraTicketPayload: JiraTicketPayloadProps,
  requestCommentList: RequestCommentType[],
  supabaseClient: SupabaseClient<Database>
): Promise<JiraTicketData> => {
  try {
    const newJiraTicketPayload = generateJiraTicketPayload(
      initialJiraTicketPayload
    );

    const jiraTicketResponse = await fetch("/api/create-jira-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newJiraTicketPayload),
    });

    const jiraTicketData = await jiraTicketResponse.json();

    if (!jiraTicketResponse.ok) {
      console.error(jiraTicketData.error);
      return { success: false, data: null };
    }

    const jiraTicketKey: string = jiraTicketData.issueKey;
    const jiraTicketWebLink: string = jiraTicketData._links.web;

    // transition jira ticket
    if (
      initialJiraTicketPayload.itemCategory.includes(`"Other Expenses"`) ||
      initialJiraTicketPayload.itemCategory.includes(`"Services"`)
    ) {
      await fetch("/api/transition-jira-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jiraTicketKey: jiraTicketKey,
          transitionId: "261",
        }),
      });
    }

    // add comments to jira ticket
    if (requestCommentList.length > 0) {
      await addCommentToJiraTicket(
        jiraTicketKey,
        supabaseClient,
        requestCommentList
      );
    }

    return { success: true, data: { jiraTicketKey, jiraTicketWebLink } };
  } catch (error) {
    console.error("Failed to create jira ticket", error);
    return { success: false, data: null };
  }
};

export const addCommentToJiraTicket = async (
  jiraTicketKey: string,
  supabaseClient: SupabaseClient<Database>,
  requestCommentList: RequestCommentType[]
) => {
  try {
    const commentListWithAttachmentUrl = await Promise.all(
      requestCommentList.map(async (comment) => {
        const commentAttachmentUrlList = await getCommentAttachment(
          supabaseClient,
          { commentId: comment.comment_id }
        );

        return {
          ...comment,
          comment_attachment: commentAttachmentUrlList,
        };
      })
    );

    const sortCommentList = commentListWithAttachmentUrl.sort((a, b) => {
      const aDate = moment(a.comment_date_created).valueOf();
      const bDate = moment(b.comment_date_created).valueOf();

      return aDate - bDate;
    });

    const jiraCommentPayload = generateJiraCommentPayload(sortCommentList);

    const requestBody = {
      body: {
        version: 1,
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Formsly Request Comment List Before Approval",
                marks: [
                  {
                    type: "strong",
                  },
                ],
              },
            ],
          },
          ...jiraCommentPayload,
        ],
      },
    };

    const jiraTicketCommentResponse = await fetch(
      `/api/add-comment-to-jira-ticket?jiraTicketKey=${jiraTicketKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!jiraTicketCommentResponse.ok) {
      console.error("Failed to add comment");
      return { success: false, data: null };
    }

    return await jiraTicketCommentResponse.json();
  } catch (error) {
    console.error("Error adding comment to jira ticket:", error);
  }
};
