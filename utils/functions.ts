/* eslint-disable @typescript-eslint/no-explicit-any */

import moment from "moment";
import dynamic from "next/dynamic";
import { RequestCommentType } from "./types";

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

export const getJiraRequestingProjectSite = (formslyItemCategory: string) => {
  const categoryMappings: Record<string, { id: string; label: string }> = {
    "BATCHING PLANT": {
      id: "10925",
      label: "BATCHING PLANT",
    },
    "CENTRAL OFFICE": {
      id: "10172",
      label: "CENTRAL OFFICE",
    },
    "PLANTS AND EQUIPMENT - CEY": {
      id: "10373",
      label: "PLANTS AND EQUIPMENT - CEY",
    },
    "ALAMINOS YARD": {
      id: "10292",
      label: "ALAMINOS YARD",
    },
    "BALINGASAG YARD": {
      id: "10792",
      label: "BALINGASAG YARD",
    },
    "PILILIA YARD": {
      id: "10398",
      label: "PILILIA YARD",
    },
    "SANTISIMO YARD": {
      id: "10379",
      label: "SANTISIMO YARD",
    },
    "MORONG CRUSHING PLANT": {
      id: "10293",
      label: "MORONG CRUSHING PLANT",
    },
    "LUZ-12-051 CATUIRAN": {
      id: "10357",
      label: "LUZ-12-051 CATUIRAN",
    },
    "VALENZUELA NETWORK": {
      id: "10175",
      label: "LUZ-14-041B VALENZUELA PLANT 2",
    },
    "LUZ-14-046 PASIG PACKAGE 1A": {
      id: "10941",
      label: "LUZ-14-046 PASIG PACKAGE 1A",
    },
    "LUZ-15-073  TUGUEGARAO-LAL-LO": {
      id: "10176",
      label: "LUZ-15-073  TUGUEGARAO-LAL-LO",
    },
    "LUZ-16-015  LA MESA WTP1": {
      id: "10177",
      label: "LUZ-16-015  LA MESA WTP1",
    },
    "LUZ-18-003 MARIVELES 500 KV": {
      id: "10178",
      label: "LUZ-18-003 MARIVELES 500 KV",
    },
    "LUZ-18-006 25MLD MORONG BULK": {
      id: "10179",
      label: "LUZ-18-006 25MLD MORONG BULK",
    },
    "SOUTH LUZON EXPRESSWAY": {
      id: "10180",
      label: "LUZ-18-007A STE TR4 PACKAGE C",
    },
    NSCR: {
      id: "10181",
      label: "LUZ-18-018 SUMITOMO NSCR",
    },
    "SUBIC FREEPORT EXPRESSWAY": {
      id: "10182",
      label: "LUZ-18-033 SFEXWIDENING",
    },
    "LUZ-18-028 MY SAN VARIOUS": {
      id: "10381",
      label: "LUZ-18-028 MY SAN VARIOUS",
    },
    "LUZ-19-002 SRE 40MLD MAGDIWANG": {
      id: "10183",
      label: "LUZ-19-002 SRE 40MLD MAGDIWANG",
    },
    "MERALCO HDD": {
      id: "10783",
      label: "LUZ-19-021 MERALCO HDD PROJECT",
    },
    "MARILAO EHV": {
      id: "10185",
      label: "LUZ-20-001 500KVA MARILAO",
    },
    "LUZ-20-002 MERALCO HDD 2": {
      id: "10784",
      label: "LUZ-20-002 MERALCO HDD 2",
    },
    "LUZ-19-016 L1CEP CPYPAR": {
      id: "10184",
      label: "LUZ-19-016 L1CEP CPYPAR",
    },
    "LUZ-20-003 ILIJAN": {
      id: "10186",
      label: "LUZ-20-003 ILIJAN",
    },
    "KIANGAN HEPP": {
      id: "10187",
      label: "LUZ-21-002 KIANGAN",
    },
    "LUZ-21-006 UPPER WAWA DAM": {
      id: "10188",
      label: "LUZ-21-006 UPPER WAWA DAM",
    },
    BCPP: {
      id: "10189",
      label: "LUZ-21-007 ILIJAN CCPP",
    },
    TUMAUINI: {
      id: "10190",
      label: "LUZ-21-009 TUMAUINI HEPPP",
    },
    "HERMOSA SAN JOSE TRANSMISSION LINE": {
      id: "10191",
      label: "LUZ-21-011 HERMOSA 500KV TL",
    },
    "LUZ-21-012 160MW BALAOI WPP": {
      id: "10192",
      label: "LUZ-21-012 160MW BALAOI WPP",
    },
    "LUZ-22-001 PNR TRP 01": {
      id: "10193",
      label: "LUZ-22-001 PNR TRP 01",
    },
    "WESTERN LUZON BACKBONE": {
      id: "10194",
      label: "LUZ-22-002 500KV BACKBONE S2",
    },
    "LUZ-22-004 MERALCO HDD 3": {
      id: "10240",
      label: "LUZ-22-004 MERALCO HDD 3",
    },
    HUDSON: {
      id: "10195",
      label: "LUZ-22-005 HUDSON PACKAGE 1",
    },
    "SOLID LF": {
      id: "10196",
      label: "LUZ-22-009 SOLID LF MAIN BLDG",
    },
    "PHILIP MORRIS": {
      id: "10237",
      label: "LUZ-22-010 PHILIP MORRIS",
    },
    "LUZ-22-011 HDD LONGOS": {
      id: "10238",
      label: "LUZ-22-011 HDD LONGOS",
    },
    CAPARISPISAN: {
      id: "10197",
      label: "LUZ-22-012A CAPARISPISAN",
    },
    "HUDSON 2": {
      id: "10239",
      label: "LUZ-23-001 HUDSON PACKAGE 2",
    },
    "LUZ-23-002 EAST BAY 200MLD WTP": {
      id: "10374",
      label: "LUZ-23-002 EAST BAY 200MLD WTP",
    },
    "MORONG PARK": {
      id: "10380",
      label: "LUZ-23-003 MORONG PARK",
    },
    "MRT 7": {
      id: "10786",
      label: "LUZ-23-005 MRT 7 NORTH AVE",
    },
    "MANOLO YARD": {
      id: "10198",
      label: "MIN-14-026B MANOLO",
    },
    "SIGUIL HYDRO": {
      id: "10199",
      label: "MIN-15-077  MW SIGUIL HYDRO",
    },
    "LAKE MAINIT": {
      id: "10200",
      label: "MIN-18-036 LAKEMAINIT",
    },
    "MALITBOG SILOO HYDRO ELECTRIC POWER PLANT": {
      id: "10201",
      label: "MIN-19-027 MALITBOG MINI HYDRO",
    },
    MANGIMA: {
      id: "10202",
      label: "MIN-21-005 12MW MANGIMA HPP",
    },
    "MAT I HYDRO ELECTRIC POWER PLANT": {
      id: "10203",
      label: "MIN-21-015 MATI-1",
    },
    "CLARIN HEPP": {
      id: "10204",
      label: "MIN-21-016 CLARIN",
    },
    "DAVAO BULK": {
      id: "10205",
      label: "MIN-22-006 DAVAO HYDRO & BW",
    },
    "MIN-22-007 ZAMBOANGA RADAR": {
      id: "10333",
      label: "MIN-22-007 ZAMBOANGA RADAR",
    },
    "MALADUGAO HYDRO": {
      id: "10206",
      label: "MIN-22-008 MALADUGAO HEPP",
    },
    "VIZ-22-003 LOBOC 2": {
      id: "10207",
      label: "VIZ-22-003 LOBOC 2",
    },
    "X'WELL": {
      id: "10376",
      label: "X'WELL",
    },
    NECO: {
      id: "10377",
      label: "NECO",
    },
    KRAH: {
      id: "10785",
      label: "KRAH",
    },
    "LEMERY BATANGAS": {
      id: "10949",
      label: "LUZ-23-006 LAND DEV LEMERY P1",
    },
    "KALAYAAN 2 WIND POWER PROJECT": {
      id: "11106",
      label: " LUZ-23-009 KALAYAAN 2 WIND",
    },
    "SAN ISIDRO SOLAR POWER PROJECT": {
      id: "10960",
      label: "VIZ-23-008 SAN ISIDRO SOLAR",
    },
  };

  return categoryMappings[formslyItemCategory];
};

export const getJiraSourcingItemCategory = (formslyItemCategory: string) => {
  const categoryMappings: Record<string, { id: string; label: string }> = {
    "Formworks Accessories": {
      id: "10397",
      label: "Formworks",
    },
    "Construction Materials": {
      id: "10394",
      label: "Construction Items",
    },
    "Fuel, Oil, Lubricants": {
      id: "10395",
      label: "Fuel",
    },
    "Fixed Asset - Construction Equipment, Machinery and Tools": {
      id: "10396",
      label: "Fixed Asset",
    },
    "Fixed Asset - Transportation Equipment": {
      id: "10396",
      label: "Fixed Asset",
    },
    "Fixed Asset - Office Machine and Equipment": {
      id: "10396",
      label: "Fixed Asset",
    },
    "Fixed Asset - Low Value Asset >50k": {
      id: "10396",
      label: "Fixed Asset",
    },
    "Spare Parts & Supplies": {
      id: "10947",
      label: "PED Items",
    },
    "Uniform and Safety Paraphernalia": {
      id: "10394",
      label: "Construction Items",
    },
    "Office Supplies & Stationeries": {
      id: "10394",
      label: "Construction Items",
    },
    "Miscellaneous Supplies": {
      id: "10394",
      label: "Construction Items",
    },
    "Minor Equipment, Furniture and Tools <50k": {
      id: "10394",
      label: "Construction Items",
    },
    "Computer Software": {
      id: "10394",
      label: "Construction Items",
    },
    "Temporary Facility": {
      id: "10394",
      label: "Construction Items",
    },
    Bidding: {
      id: "10394",
      label: "Construction Items",
    },
  };

  return categoryMappings[formslyItemCategory];
};

const getWarehouseCorporateLead = (formslyItemCategory: string) => {
  const matcher = [
    {
      categories: ["Construction Items", "PED Items"],
      fullName: "Meynard F. Gante",
      jiraAccountId: "712020:5569bf38-2e86-4a70-9f86-24d79f271743",
      emailAddress: "meynard.gante@staclara.com.ph",
    }, // Consumables
    {
      categories: ["Fixed Asset", "Formworks"],
      fullName: "Aljoy Mulles",
      jiraAccountId: "712020:5408443f-bcc0-4a94-9292-9128ae67c599",
      emailAddress: "aljoy.mulles@staclara.com.ph",
    },
    {
      categories: ["Fuel"],
      fullName: "Christian Balatero - Fuel Mgmt. Lead (Active)",
      jiraAccountId: "712020:0c9a62a0-05e4-44e8-9dca-bdce04bca64b",
      accountType: "atlassian",
      emailAddress: "christian.balatero@staclara.com.ph",
    },
  ];

  const matchedUser = matcher.find((matcherItem) =>
    matcherItem.categories.includes(formslyItemCategory)
  );

  return matchedUser ? matchedUser.jiraAccountId : null;
};

const getWarehouseAreaLead = (formslyItemCategory: string) => {
  const matcher = [
    {
      items: [
        "LUZ-21-011 HERMOSA 500KV TL",
        "LUZ-22-002 500KV BACKBONE S2",
        "LUZ-21-002 KIANGAN",
        "LUZ-21-009 TUMAUINI HEPPP",
        "LUZ-21-012 160MW BALAOI WPP",
        "LUZ-22-012A CAPARISPISAN",
        "LUZ-23-003 MORONG PARK",
        "CENTRAL OFFICE",
      ],
      fullName: "Rey Berlon",
      jiraAccountId:
        "qm:1ba2089e-c98a-4c4b-9487-b12072afc5c6:bace021b-e2a6-4981-a644-98ed7859f837",
      emailAddress: "rey.berlon@staclara.com.ph",
    },
    {
      items: [
        "LUZ-18-018 SUMITOMO NSCR",
        "LUZ-20-001 500KVA MARILAO",
        "LUZ-14-041B VALENZUELA PLANT 2",
        "LUZ-21-006 UPPER WAWA DAM",
        "LUZ-19-002 SRE 40MLD MAGDIWANG",
        "PILILIA YARD",
        "ALAMINOS YARD",
        "LUZ-22-004 MERALCO HDD 3",
        "LUZ-23-005 MRT 7 NORTH AVE",
        "LUZ-22-002 500KV BACKBONE S2",
      ],
      fullName: "Rey Berlon",
      jiraAccountId:
        "qm:1ba2089e-c98a-4c4b-9487-b12072afc5c6:bace021b-e2a6-4981-a644-98ed7859f837",
      emailAddress: "rey.berlon@staclara.com.ph",
    },
    {
      items: [
        "LUZ-20-003 ILIJAN",
        "LUZ-21-007 ILIJAN CCPP",
        "LUZ-18-007A STE TR4 PACKAGE C",
        "LUZ-22-005 HUDSON PACKAGE 1",
        "LUZ-23-001 HUDSON PACKAGE 2",
        "LUZ-22-009 SOLID LF MAIN BLDG",
        "LUZ-22-010 PHILIP MORRIS",
        "LUZ-12-051 CATUIRAN",
        "LUZ-23-002 EAST BAY 200MLD WTP",
        " LUZ-23-009 KALAYAAN 2 WIND", // added on 2024-02-01 16:14 info from Bry Paras
      ],
      fullName: "Vincent Andallo- Luzon C Area Lead (Active)",
      jiraAccountId:
        "qm:1ba2089e-c98a-4c4b-9487-b12072afc5c6:e8ab391d-90e2-46fb-9ae8-e81fa6991ab3",
      emailAddress: "vincent.andallo.staclara@gmail.com",
    },
    {
      items: [
        "MIN-18-036 LAKEMAINIT",
        "MIN-19-027 MALITBOG MINI HYDRO",
        "MIN-21-015 MATI-1",
        "MIN-21-016 CLARIN",
        "MIN-21-005 12MW MANGIMA HPP",
        "MIN-22-008 MALADUGAO HEPP",
        "MIN-22-006 DAVAO HYDRO &amp; BW",
        "MIN-15-077 MW SIGUIL HYDRO",
        "VIZ-22-003 LOBOC 2",
      ],
      fullName: "Vincent Andallo- Luzon C Area Lead (Active)",
      jiraAccountId:
        "qm:1ba2089e-c98a-4c4b-9487-b12072afc5c6:e8ab391d-90e2-46fb-9ae8-e81fa6991ab3",
      emailAddress: "vincent.andallo.staclara@gmail.com",
    },
    {
      items: ["MIN-15-077  MW SIGUIL HYDRO", "VIZ-23-008 SAN ISIDRO SOLAR"],
      fullName: "Christopher Waga",
      jiraAccountId: "5f1e1c29c1b9f4001c6c7126",
      emailAddress: "christopher.waga@staclara.com.ph",
    },
  ];

  const matchedUser = matcher.find((matcherItem) =>
    matcherItem.items.includes(formslyItemCategory)
  );

  return matchedUser ? matchedUser.jiraAccountId : null;
};

export const generateJiraTicketPayload = ({
  requestId,
  requestUrl,
  requestTypeId,
  projectName,
  itemCategory,
  primaryApproverJiraAccountId,
}: {
  requestId: string;
  requestUrl: string;
  requestTypeId: string;
  projectName: string;
  itemCategory: string[];
  primaryApproverJiraAccountId: string | null;
}) => {
  const requestingProjectSite = getJiraRequestingProjectSite(projectName);
  const sourcingItemCategory = getJiraSourcingItemCategory(
    JSON.parse(itemCategory[0])
  );

  if (!requestingProjectSite) {
    console.error(
      "Requesting Project Site is not found on Jira Requesting Project Site"
    );
    throw Error(
      "Requesting Project Site is not found on Jira Requesting Project Site"
    );
  }

  if (!sourcingItemCategory) {
    console.error("Item Category is not found on Jira Item Category");
    throw Error("Item Category is not found on Jira Item Category");
  }

  const warehouseCorporateLead = getWarehouseCorporateLead(
    sourcingItemCategory.label
  );
  const warehouseAreaLead = getWarehouseAreaLead(requestingProjectSite.label);

  if (!warehouseCorporateLead) {
    console.error("Warehouse Corporate Lead is not found.");
    throw Error("Warehouse Corporate Lead is not found.");
  }

  if (!warehouseAreaLead) {
    console.error("Warehouse Area Lead is not found.");
    throw Error("Warehouse Area Lead is not found.");
  }

  console.log(warehouseAreaLead);

  const jiraTicketPayload = {
    form: {
      answers: {
        "1": {
          choices: [requestingProjectSite.id], // Requesting Project Site
        },
        "2": {
          choices: [sourcingItemCategory.id], // Item Category
        },
        "3": {
          text: requestId, // RF Number
        },
        "4": {
          text: requestId, // Formsly ID
        },
        "5": {
          text: requestUrl, // Formsly URL
        },
        "6": {
          choices: [], // attachments
        },
        "11": {
          users: [warehouseCorporateLead], // Warehouse Corporate Lead
        },
        "14": {
          users: [warehouseAreaLead], // Warehouse Area Lead
        },
        "15": {
          choices: ["1"], // Origin of Request
        },
      },
    },
    isAdfRequest: false,
    requestFieldValues: {},
    requestParticipants: [] as string[],
    requestTypeId: requestTypeId,
    serviceDeskId: "17",
  };

  if (primaryApproverJiraAccountId) {
    jiraTicketPayload.requestParticipants.push(primaryApproverJiraAccountId);
  }

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
              } ${formattedDate} ${new Date(
                comment.comment_date_created
              ).toDateString()}`,
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
