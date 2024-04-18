import { getCommentAttachment } from "@/backend/api/get";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { Database } from "./database";
import {
  formatJiraTicketPayload,
  generateJiraCommentPayload,
} from "./functions";
import {
  JiraTicketData,
  JiraTicketPayloadProps,
  RequestCommentType,
} from "./types";

type CreateJiraTicketProps = {
  jiraTicketPayload: JiraTicketPayloadProps;
  jiraItemCategoryLabel: string;
  requestCommentList: RequestCommentType[];
  supabaseClient: SupabaseClient<Database>;
};

export const createJiraTicket = async ({
  jiraTicketPayload,
  jiraItemCategoryLabel,
  requestCommentList,
  supabaseClient,
}: CreateJiraTicketProps): Promise<JiraTicketData> => {
  try {
    const formattedJiraTicketPayload =
      formatJiraTicketPayload(jiraTicketPayload);

    const duplicateJiraTicketResponse = await fetch(
      `/api/check-jira-duplicate-ticket?formslyId=${jiraTicketPayload.requestId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const duplicateJiraTicketData = await duplicateJiraTicketResponse.json();

    if (duplicateJiraTicketData.total > 0) {
      console.log(duplicateJiraTicketData.total);
      console.error("Duplicate jira ticket");
      return { success: false, data: null };
    }

    const jiraTicketResponse = await fetch("/api/create-jira-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedJiraTicketPayload),
    });

    const jiraTicketData = await jiraTicketResponse.json();

    if (!jiraTicketResponse.ok) {
      console.error(jiraTicketData.error);
      return { success: false, data: null };
    }

    const jiraTicketKey: string = jiraTicketData.issueKey;
    const jiraTicketWebLink: string = jiraTicketData._links.web;

    // transition jira ticket
    if (["Other Expenses", "Services"].includes(jiraItemCategoryLabel)) {
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
