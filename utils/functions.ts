/* eslint-disable @typescript-eslint/no-explicit-any */

import jwt from "jsonwebtoken";
import moment from "moment";
import dynamic from "next/dynamic";
import { formatDate } from "./constant";
import {
  JiraITAssetTicketPayloadProps,
  JiraItemUserTableData,
  JiraTicketPayloadProps,
  RequestCommentType,
} from "./types";

// check if a value is empty
export const isEmpty = (value: any) => {
  if (value == null) {
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
};

// check if a valueA is equal to valueB
export const isEqual = (a: any, b: any) => {
  // Check if the types of a and b are the same
  if (typeof a !== typeof b) {
    return false;
  }

  // For primitive types and functions, use strict equality (===)
  if (typeof a !== "object" || a === null) {
    return a === b;
  }

  // For arrays, compare their lengths and elements
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // For objects, compare their keys and values
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
};

export const generateRandomId = () => {
  // Generate a random number and convert it to a hexadecimal string
  const randomId = Math.random().toString(16).slice(2);

  return randomId;
};

export const customMathCeil = (number: number, precision = 0) => {
  const multiplier = 10 ** precision;
  return Math.ceil(number * multiplier) / multiplier;
};

export const addDays = (date: Date, days: number) => {
  date.setDate(date.getDate() + days);
  return date;
};

export const isValidUrl = (urlString: string) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export const checkIfTimeIsWithinFiveMinutes = (
  timestampString: string,
  currentDateString: string
) => {
  const timestamp = moment(timestampString);
  const currentTime = moment(currentDateString);
  const differenceInMinutes = currentTime.diff(timestamp, "minutes");

  return differenceInMinutes <= 5;
};

export const isStringParsable = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const safeParse = (str: string) => {
  if (isStringParsable(str)) {
    return JSON.parse(str);
  } else {
    return str;
  }
};

export const mostOccurringElement = (arr: string[]) => {
  const frequencyMap: Record<string, number> = {};
  let maxFrequency = 0;
  let mostOccurringElement = arr[0];

  arr.forEach((element) => {
    frequencyMap[element] = (frequencyMap[element] || 0) + 1;
    if (frequencyMap[element] > maxFrequency) {
      maxFrequency = frequencyMap[element];
      mostOccurringElement = element;
    }
  });

  return mostOccurringElement;
};

export const formatJiraTicketPayload = ({
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
        "6": {
          choices: [], // attachments
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
export const JoyRideNoSSR = dynamic(() => import("react-joyride"), {
  ssr: false,
});

export const getBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
  });
};

export const fetchNumberFromString = (inputString: string) => {
  const regex = /\d+/g;
  const matches = inputString.match(regex);
  if (matches) {
    return parseInt(matches[0]);
  } else {
    return null;
  }
};

export const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 10;
  const from = page ? page * limit : 0;
  const to = page ? from + size - 1 : size - 1;
  return { from, to };
};

export const formatJiraItemUserTableData = (
  data: JiraItemUserTableData | null
) => {
  if (!data) return { success: false, data: null, error: "Data not found" };

  const formattedData = {
    jira_item_user_id: data.jira_item_user_id,
    jira_item_user_item_category_id: data.jira_item_user_item_category_id,
    jira_user_account_jira_id:
      data.jira_item_user_account_id?.jira_user_account_jira_id || "",
    jira_user_account_display_name:
      data.jira_item_user_account_id?.jira_user_account_display_name || "",
    jira_user_account_id:
      data.jira_item_user_account_id?.jira_user_account_id || "",
    jira_user_role_id: data.jira_item_user_role_id?.jira_user_role_id || "",
    jira_user_role_label:
      data.jira_item_user_role_id?.jira_user_role_label || "",
  };

  return { success: true, data: formattedData, error: null };
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
    requestTypeId: requestTypeId,
    serviceDeskId: "3",
  };

  return jiraTicketPayload;
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

export const verifyJwtToken = async ({
  token,
  secretKey,
}: {
  token: string;
  secretKey: string;
}) => {
  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateEmailInviteToken = ({
  teamId,
  teamName,
  invitedEmail,
  secretKey,
}: {
  teamId: string;
  teamName: string;
  invitedEmail: string;
  secretKey: string;
}) => {
  const inviteParameter = {
    teamId,
    teamName,
    invitedEmail,
  };

  const jwtInviteToken = jwt.sign(inviteParameter, secretKey, {
    expiresIn: "48h",
  });

  return jwtInviteToken;
};

export const sendEmailTeamInvite = async ({
  emailList,
  teamName,
  teamId,
}: {
  emailList: string[];
  teamId: string;
  teamName: string;
}) => {
  const subject = `You have been invited to join ${teamName} on Formsly.`;

  const response = await fetch("/api/resend/send-team-invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: emailList,
      subject,
      teamId: teamId,
      teamName: teamName,
    }),
  });

  const responseData = await response.json();
  return responseData;
};
