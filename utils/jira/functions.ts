import {
  getCommentAttachment,
  getJiraAutomationDataByProjectId,
} from "@/backend/api/get";
import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment";
import { Database } from "oneoffice-api";
import { formatDate } from "../constant";
import { addHttpsToUrlIfMissing } from "../functions";
import {
  JiraESRTicketPayloadProps,
  JiraITAssetTicketPayloadProps,
  JiraLRFTicketPayloadProps,
  JiraPTRFTicketPayloadProps,
  JiraPayloadType,
  JiraRFPTicketPayloadProps,
  JiraTicketPayloadProps,
  JiraWAVTicketPayloadProps,
  RequestCommentType,
} from "../types";

type NewCreateJiraTicketProps = {
  requestType: string;
  formslyId: string;
  organizationId?: string;
  transitionId?: string;
  requestCommentList: RequestCommentType[];
  ticketPayload: JiraPayloadType;
};

export const createJiraTicket = async (props: NewCreateJiraTicketProps) => {
  const createTicketResponse = await fetch("/api/jira/create-ticket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(props),
  });
  const jiraTicket = await createTicketResponse.json();
  if (!jiraTicket.jiraTicketId) {
    throw new Error("Failed to create jira ticket.");
  }
  return jiraTicket;
};

export const createJiraCommentRequestBody = async (
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

    return requestBody;
  } catch (error) {
    console.error("Error adding comment to jira ticket:", error);
  }
};

export const getJiraTransitionId = (requestFormType: string) => {
  const matcher = [
    {
      categories: ["item", "ped part", "ped equipment", "ped item"],
      id: "141",
      name: "Material",
    },
    {
      categories: ["other expenses", "services"],
      id: "341",
      name: "Other Expense/Service",
    },
  ];

  const matchedItem = matcher.find((item) =>
    item.categories.includes(requestFormType.toLowerCase())
  );

  return matchedItem ? matchedItem.id : null;
};

export const getJiraRequestType = (requestFormType: string) => {
  const matcher = [
    {
      categories: ["item", "ped part", "ped equipment", "ped item"],
      id: "11119",
      name: "Material Notation",
    },
    {
      categories: ["other expenses", "services"],
      id: "11120",
      name: "Other Services",
    },
  ];

  const matchedItem = matcher.find((item) =>
    item.categories.includes(requestFormType.toLowerCase())
  );

  return matchedItem ? matchedItem.id : null;
};

export const generateJiraCommentPayload = (
  commentList: RequestCommentType[]
) => {
  const commentListForJira = commentList.map((comment) => {
    const commenter = comment.comment_team_member.team_member_user;
    const attachmentContent = comment.comment_attachment.map((attachment) => {
      const attachmentComment = {
        type: "text",
        text: attachment.attachment_name + " \n",
        marks: [
          {
            type: "link",
            attrs: {
              href: attachment.attachment_public_url,
              title: attachment.attachment_name,
            },
          },
        ],
      };
      return attachmentComment;
    });

    const formattedDate = moment(comment.comment_date_created).format("LTS");

    const jiraComment = {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `${commenter.user_first_name} ${
                commenter.user_last_name
              } ${formattedDate} ${formatDate(
                new Date(comment.comment_date_created)
              )}`,
            },
            {
              type: "hardBreak",
            },
            {
              type: "text",
              text: comment.comment_content,
            },
          ],
        },
      ],
    };

    if (attachmentContent.length > 0) {
      jiraComment.content.push({
        type: "paragraph",
        content: [...attachmentContent],
      });
    }

    return jiraComment;
  });

  return commentListForJira;
};

export const getRequisitionAutomationData = async (
  supabaseClient: SupabaseClient<Database>,
  params: { teamProjectId: string; itemCategory: string }
) => {
  const { teamProjectId, itemCategory } = params;
  const jiraAutomationData = await getJiraAutomationDataByProjectId(
    supabaseClient,
    { teamProjectId }
  );

  if (!jiraAutomationData?.jiraProjectData) {
    throw new Error("Error fetching of Jira project and item category data.");
  }

  const { jiraProjectData, jiraItemCategoryData, jiraOrganizationData } =
    jiraAutomationData;

  const itemCategoryMatch = jiraItemCategoryData.find(
    (item) => item.jira_item_category_formsly_label === itemCategory
  );

  if (!jiraProjectData || !itemCategoryMatch) {
    throw new Error("Jira project and item category data is missing.");
  }

  const warehouseAreaLead = jiraProjectData.jira_user_list.filter(
    (user) => user.jira_user_role_label === "WAREHOUSE AREA LEAD"
  )[0];
  const warehouseRepresentative = jiraProjectData.jira_user_list.filter(
    (user) => user.jira_user_role_label === "WAREHOUSE REPRESENTATIVE"
  )[0];
  const warehouseRequestParticipant = jiraProjectData.jira_user_list.filter(
    (user) => user.jira_user_role_label === "WAREHOUSE REQUEST PARTICIPANT"
  );

  if (!warehouseAreaLead || !warehouseRepresentative) {
    throw new Error("Warehouse area lead and representative data is missing.");
  }

  const jiraOrganizationId = jiraOrganizationData
    ? jiraOrganizationData.jira_organization_jira_id
    : "";

  const requisitionAutomationData = {
    jiraProjectSiteId: jiraProjectData.jira_project_jira_id,
    jiraItemCategoryId: itemCategoryMatch.jira_item_category_jira_id,

    warehouseCorporateLeadId: itemCategoryMatch.jira_user_account_jira_id,
    warehouseAreaLeadId: warehouseAreaLead.jira_user_account_jira_id,
    warehouseRepresentativeId:
      warehouseRepresentative.jira_user_account_jira_id,
    warehouseRequestParticipantIdList:
      warehouseRequestParticipant.length > 0
        ? warehouseRequestParticipant.map(
            (user) => user.jira_user_account_jira_id
          )
        : [],
    jiraItemCategoryLabel: itemCategoryMatch.jira_item_category_jira_label,
    jiraOrganizationId,
  };

  return requisitionAutomationData;
};

export const formatJiraITAssetPayload = ({
  requestId,
  requestUrl,
  requestTypeId,
  jiraProjectSiteId,
  employeeName,
  purpose,
  item,
}: JiraITAssetTicketPayloadProps) => {
  const jiraTicketPayload = {
    form: {
      answers: {
        "1": {
          choices: [item], // IT Asset Item
        },
        "2": {
          choices: [purpose], // Purpose
        },
        "3": {
          text: employeeName, // Employee Name
        },
        "4": {
          choices: [jiraProjectSiteId], // Requesting Project
        },
        "5": {
          text: requestUrl, // Formsly URL
        },
        "6": {
          text: requestId, // Formsly Id
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: [],
    requestTypeId: requestTypeId,
    serviceDeskId: "3",
  };

  return jiraTicketPayload;
};

export const formatJiraRequisitionPayload = ({
  requestId,
  requestUrl,
  requestTypeId,
  requestFormType,
  jiraProjectSiteId,
  jiraItemCategoryId,
  warehouseCorporateLeadId,
  warehouseAreaLeadId,
  warehouseRepresentativeId,
  warehouseRequestParticipantIdList,
  jiraItemCategoryLabel,
}: JiraTicketPayloadProps) => {
  const itemCategoryDoesNotRequireWarehouseLead = [
    "Other Expenses",
    "Services",
  ].includes(`${jiraItemCategoryLabel}`);

  const warehouseCorporateLeadValue = itemCategoryDoesNotRequireWarehouseLead
    ? []
    : [warehouseCorporateLeadId];

  const warehouseAreaLeadValue = itemCategoryDoesNotRequireWarehouseLead
    ? []
    : [warehouseAreaLeadId];

  const jiraRequestType = getJiraRequestType(requestFormType);

  const jiraTicketPayload = {
    form: {
      answers: {
        "21": {
          choices: [jiraProjectSiteId], // Requesting Project Site
        },
        "23": {
          choices: [jiraItemCategoryId], // Item Category
        },
        "3": {
          text: requestId, // RF Number
        },
        "4": {
          text: requestId, // Formsly ID
        },
        "20": {
          text: requestUrl, // Formsly URL
        },
        "11": {
          users: warehouseCorporateLeadValue, // Warehouse Corporate Lead
        },
        "14": {
          users: warehouseAreaLeadValue, // Warehouse Area Lead
        },
        "15": {
          choices: ["1"], // Origin of Request
        },
        "26": {
          choices: [jiraRequestType],
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: warehouseRequestParticipantIdList,
    requestTypeId: requestTypeId,
    serviceDeskId: "17",
    raiseOnBehalfOf: warehouseRepresentativeId,
  };

  return jiraTicketPayload;
};

export const formatJiraLRFRequisitionPayload = ({
  requestId,
  requestUrl,
  jiraProjectSiteId,
  department,
  purpose,
  typeOfRequest,
  workingAdvances,
  ticketUrl,
  requestor,
  boqCode,
  costCode,
}: JiraLRFTicketPayloadProps) => {
  // if department = plants and equipment, use PED jira form
  const isPEDDepartment = department === "10164";
  const requestTypeId = isPEDDepartment ? "406" : "367";
  const serviceDeskId = isPEDDepartment ? "27" : "23";

  let jiraTicketPayload: JiraPayloadType = {
    form: {
      answers: {
        "471": {
          text: requestor, // Requestor Name
        },
        "442": {
          choices: [typeOfRequest], // Type
        },
        "445": {
          choices: [workingAdvances], // Working Advances
        },
        "444": {
          text: addHttpsToUrlIfMissing(ticketUrl),
        },
        "473": {
          text: requestId, // Formsly Id
        },
        "472": {
          text: requestUrl, // Formsly URL
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestTypeId,
    serviceDeskId,
    requestParticipants: [],
  };

  if (isPEDDepartment) {
    jiraTicketPayload = {
      ...jiraTicketPayload,
      form: {
        answers: {
          ...jiraTicketPayload.form.answers,
          475: {
            choices: [department], // Department
          },
          476: {
            choices: [jiraProjectSiteId], // Requesting Project
          },
          479: {
            text: costCode, // Cost code
          },
          480: {
            text: boqCode, // BOQ code
          },
          15: {
            text: purpose, // Purpose
          },
        },
      },
    };
  } else {
    jiraTicketPayload = {
      ...jiraTicketPayload,
      form: {
        answers: {
          ...jiraTicketPayload.form.answers,
          469: {
            choices: [department], // Department
          },
          468: {
            choices: [jiraProjectSiteId], // Requesting Project
          },
          475: {
            text: purpose, // Purpose
          },
        },
      },
    };
  }

  return jiraTicketPayload;
};

export const formatJiraPTRFPayload = ({
  requestId,
  requestUrl,
  typeOfTransfer,
  mannerOfTransfer,
  department,
  projectNameFrom,
  projectNameTo,
  purpose,
  withITAsset,
}: JiraPTRFTicketPayloadProps) => {
  const jiraTicketPayload = {
    form: {
      answers: {
        "1": {
          choices: [typeOfTransfer], // Type of Transfer
        },
        "34": {
          choices: [mannerOfTransfer], // Manner of Transfer
        },
        "42": {
          choices: [department], // Department
        },
        "36": {
          choices: [projectNameFrom], // Project Name From
        },
        "38": {
          choices: [projectNameTo], // Project Name To
        },
        "43": {
          choices: [purpose], // Purpose
        },
        "53": {
          text: requestUrl, // Formsly URL
        },
        "54": {
          text: requestId, // FormslyId
        },
        "55": {
          choices: [withITAsset ? "11129" : "11130"],
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: [],
    requestTypeId: "405",
    serviceDeskId: "4",
  };

  return jiraTicketPayload;
};

export const formatJiraWAVPayload = ({
  requestId,
  requestUrl,
  jiraProjectSiteId,
  date,
  payeeName,
  amount,
  amountInWord,
  particulars,
}: JiraWAVTicketPayloadProps) => {
  const jiraTicketPayload = {
    form: {
      answers: {
        "6": {
          text: payeeName, // Payee Name
        },
        "5": {
          date: date, // Date
        },
        "13": {
          choices: [jiraProjectSiteId], // Requesting Project
        },
        "16": {
          text: amount, // Amount
        },
        "17": {
          text: amountInWord, // Amount in Words
        },
        "11": {
          text: particulars, // Particulars
        },
        "20": {
          text: requestId, // Formsly Id
        },
        "21": {
          text: requestUrl, // Formsly URL
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: [],
    requestTypeId: "407",
    serviceDeskId: "23",
  };

  return jiraTicketPayload;
};

export const formatJiraESRPayload = ({
  requestId,
  requestUrl,
  jiraProjectSiteId,
  requestorName,
  department,
  workcode,
  propertyNumber,
}: JiraESRTicketPayloadProps) => {
  const jiraTicketPayload = {
    form: {
      answers: {
        "1": {
          choices: [jiraProjectSiteId], // Requesting Project
        },
        "3": {
          text: requestorName, // Requestor Name
        },
        "4": {
          choices: [department], // Department
        },
        "7": {
          choices: [workcode], // Workcode
        },
        "10": {
          choices: [propertyNumber], // Property No.
        },
        "20": {
          text: requestId, // FormslyId
        },
        "21": {
          text: requestUrl, // Formsly URL
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: [],
    requestTypeId: "409",
    serviceDeskId: "27",
  };

  return jiraTicketPayload;
};

export const formatJiraRFPPayload = ({
  requestId,
  requestUrl,
  jiraProjectSiteId,
  department,
  purpose,
  urgency,
  departmentCode,
  chargeTo,
  payeeType,
  boqCode,
  costCode,
}: JiraRFPTicketPayloadProps) => {
  // if department = plants and equipment, use PED jira form
  const isPEDDepartment = department === "10164";
  const requestTypeId = isPEDDepartment ? "333" : "337";
  const serviceDeskId = isPEDDepartment ? "27" : "23";

  const jiraTicketPayload: JiraPayloadType = {
    form: {
      answers: {
        "5": {
          choices: [urgency],
        },
        "1": {
          choices: [jiraProjectSiteId],
        },
        "6": {
          choices: [department],
        },
        "8": {
          choices: [payeeType],
        },
        "13": {
          choices: [purpose],
        },
        "18": {
          choices: [chargeTo],
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestTypeId,
    serviceDeskId,
    requestParticipants: [],
  };

  if (jiraProjectSiteId === "10172") {
    jiraTicketPayload.form.answers["12"] = {
      text: departmentCode,
    };
  }

  if (isPEDDepartment) {
    jiraTicketPayload.form.answers["21"] = {
      text: costCode,
    };
    jiraTicketPayload.form.answers["22"] = {
      text: boqCode,
    };
    jiraTicketPayload.form.answers["23"] = {
      text: requestId,
    };
    jiraTicketPayload.form.answers["24"] = {
      text: requestUrl,
    };
  } else {
    jiraTicketPayload.form.answers["19"] = {
      text: requestId,
    };
    jiraTicketPayload.form.answers["20"] = {
      text: requestUrl,
    };
  }

  return jiraTicketPayload;
};
