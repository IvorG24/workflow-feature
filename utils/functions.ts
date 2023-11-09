/* eslint-disable @typescript-eslint/no-explicit-any */

import moment from "moment";

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

export const getJiraSourcingItemCategory = (formslyItemCategory: string) => {
  switch (formslyItemCategory) {
    case "Formworks Accessories":
      return "Formworks";

    case "Construction Materials":
      return "Construction Items";

    case "Fuel, Oil, Lubricants":
      return "Fuel";

    case "Fixed Asset - Construction Equipment, Machinery and Tools":
      return "Fixed Asset";

    case "Fixed Asset - Transportation Equipment":
      return "Fixed Asset";
    case "Fixed Asset - Office Machine and Equipment":
      return "Fixed Asset";
    case "Fixed Asset - Low Value Asset >50k":
      return "Fixed Asset";

    default:
      break;
  }
};

export const generateJiraTicket = ({
  projectName,
  itemCategory,
  requestId,
  requestUrl,
}: {
  projectName: string;
  itemCategory: string[];
  requestId: string;
  requestUrl: string;
}) => {
  const sourcingItemCategory = getJiraSourcingItemCategory(
    JSON.parse(itemCategory[0])
  );

  return {
    fields: {
      project: {
        id: "10031",
        key: "SCSM",
      },
      summary: "Request Form for Notation",
      issuetype: {
        name: "Sourcing",
      },
      reporter: {
        accountId: "712020:aae076f5-c5d1-4e92-82fe-acb5ada4bc7c", // SCIC Dev Jira Account
      },
      customfield_10102: {
        value: projectName,
      },
      customfield_10209: {
        value: sourcingItemCategory,
      },
      customfield_10010: "189", // Request Type
      customfield_10168: requestId,
      customfield_10297: requestId,
      customfield_10296: requestUrl,
      customfield_10298: {
        value: "Formsly", // apiSource
      },
    },
  };
};
