import moment from "moment";
import { NodeHtmlMarkdown } from "node-html-markdown";

export const isValidTeamName = (name: string): boolean => {
  const allowedCharsRegex = /^[a-zA-Z0-9 ,;\/?:@&=+$\-_.!]*$/;

  if (name.length < 1 || name.length > 50) {
    return false;
  }

  if (!allowedCharsRegex.test(name)) {
    return false;
  }

  return true;
};

export const requestPath = (requestId: string) => {
  return `http://${window.location.host}/team-requests/requests/${requestId}`;
};

export const regExp = /\(([^)]+)\)/;

export const addCommaToNumber = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const startCase = (inputString: string) => {
  return inputString
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatTime = (time: string) => {
  const parsedTime = parseJSONIfValid(time);
  if (!parsedTime) return parsedTime;
  const timeParts = parsedTime.split(":");
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const parseJSONIfValid = (jsonString: string) => {
  try {
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    return jsonString;
  }
};

export const convertTimestampToDate = (input: string | Date) => {
  if (input instanceof Date) return input;
  const parsedInput = parseJSONIfValid(input);
  if (!parsedInput) return undefined;
  return new Date(parsedInput);
};

export const toTitleCase = (input: string) => {
  return input.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
};

export const formatTeamNameToUrlKey = (teamName: string) => {
  return teamName.replace(/\s+/g, "-").toLowerCase();
};

export const isUUID = (str: string | string[] | undefined) => {
  if (str === undefined) return false;
  if (Array.isArray(str)) return false;
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidPattern.test(str);
};

export const convertTimestampToDateTime = (
  timestamptz: string
): { date: string; time: string } | null => {
  try {
    const timestamp = new Date(timestamptz);
    const date = timestamp.toISOString().split("T")[0];
    const hours = timestamp.getHours() % 12 || 12;
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes} ${
      timestamp.getHours() < 12 ? "AM" : "PM"
    }`;

    return { date, time };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const parseHtmlToMarkdown = (html: string) => {
  const htmlToMarkdownParser = new NodeHtmlMarkdown();

  return htmlToMarkdownParser.translate(html);
};

export const checkIfHtmlStringIsEmpty = (html: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const element = doc.body.firstChild as Element;
  // Check if element exists and is an Element node
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    return element.innerHTML.trim() === "";
  }

  return true;
};

export const getInitials = (fullname: string) => {
  const words = fullname.trim().split(" ");
  const initials = words.map((word) => word[0].toUpperCase()).join("");
  return initials;
};

export const getMemoReferencePrefix = (teamName: string) => {
  return `MEMO-${teamName.toUpperCase().split(" ").join("")}-${moment().format(
    "YYYY"
  )}`;
};
