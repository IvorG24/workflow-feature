import { getCommentAttachment } from "@/backend/api/get";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { Database } from "./database";
import {
  formatJiraBOQPayload,
  formatJiraITAssetPayload,
  formatJiraTicketPayload,
  generateJiraCommentPayload,
  getJiraTransitionId,
  isEmpty,
} from "./functions";
import {
  JiraBOQTicketPayloadProps,
  JiraITAssetTicketPayloadProps,
  JiraTicketData,
  JiraTicketPayloadProps,
  RequestCommentType,
} from "./types";

type CreateJiraTicketProps = {
  jiraTicketPayload:
    | JiraTicketPayloadProps
    | JiraITAssetTicketPayloadProps
    | JiraBOQTicketPayloadProps;
  requestCommentList: RequestCommentType[];
  supabaseClient: SupabaseClient<Database>;
  isITAsset?: boolean;
};

export const createJiraTicket = async ({
  jiraTicketPayload,
  requestCommentList,
  supabaseClient,
}: CreateJiraTicketProps): Promise<JiraTicketData> => {
  try {
    let formattedJiraTicketPayload = null;

    switch (jiraTicketPayload.requestFormType) {
      case "IT Asset":
        formattedJiraTicketPayload = formatJiraITAssetPayload(
          jiraTicketPayload as JiraITAssetTicketPayloadProps
        );
        break;

      case "BOQ":
        formattedJiraTicketPayload = formatJiraBOQPayload(
          jiraTicketPayload as JiraBOQTicketPayloadProps
        );
        break;

      default:
        formattedJiraTicketPayload = formatJiraTicketPayload(
          jiraTicketPayload as JiraTicketPayloadProps
        );
        break;
    }

    let requestType = "Automated Requisition Form";

    switch (jiraTicketPayload.requestFormType) {
      case "IT Asset":
        requestType = "IT Requisition Form";
        break;

      case "BOQ":
        requestType = "Request for Liquidation/Reimbursement v2";
        break;

      default:
        break;
    }

    const duplicateJiraTicketResponse = await fetch(
      `/api/check-jira-duplicate-ticket?formslyId=${jiraTicketPayload.requestId}&requestType=${requestType}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const duplicateJiraTicketData = await duplicateJiraTicketResponse.json();

    if (duplicateJiraTicketData.total > 0) {
      const duplicateTicket = duplicateJiraTicketData.issues[0];
      const jiraTicketKey: string = duplicateTicket.key;
      const jiraTicketWebLink: string =
        duplicateTicket.fields["customfield_10010"]._links.web;

      if (!isEmpty(jiraTicketKey) || !isEmpty(jiraTicketWebLink)) {
        return { success: true, data: { jiraTicketKey, jiraTicketWebLink } };
      }
    }

    let organizationId = "";
    if (!["IT Asset", "BOQ"].includes(jiraTicketPayload.requestFormType)) {
      const currentJiraPayload = jiraTicketPayload as JiraTicketPayloadProps;
      organizationId = currentJiraPayload.jiraOrganizationId;
    }

    const jiraTicketResponse = await fetch("/api/create-jira-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: formattedJiraTicketPayload,
        organizationId: organizationId,
      }),
    });

    const jiraTicketData = await jiraTicketResponse.json();
    if (!jiraTicketResponse.ok) {
      console.error(jiraTicketData.error);
      return { success: false, data: null };
    }

    const jiraTicketKey: string = jiraTicketData.issueKey;
    const jiraTicketWebLink: string = jiraTicketData._links.web;

    // transition jira ticket
    if (!["IT Asset", "BOQ"].includes(jiraTicketPayload.requestFormType)) {
      await fetch("/api/transition-jira-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jiraTicketKey: jiraTicketKey,
          transitionId: getJiraTransitionId(jiraTicketPayload.requestFormType),
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
