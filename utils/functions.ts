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
  const categoryMappings: Record<string, string> = {
    "Formworks Accessories": "Formworks",
    "Construction Materials": "Construction Items",
    "Fuel, Oil, Lubricants": "Fuel",
    "Fixed Asset - Construction Equipment, Machinery and Tools": "Fixed Asset",
    "Fixed Asset - Transportation Equipment": "Fixed Asset",
    "Fixed Asset - Office Machine and Equipment": "Fixed Asset",
    "Fixed Asset - Low Value Asset >50k": "Fixed Asset",
    "Spare Parts & Supplies": "PED Items",
    "Uniform and Safety Paraphernalia": "Construction Items",
    "Office Supplies & Stationeries": "Construction Items",
    "Miscellaneous Supplies": "Construction Items",
    "Minor Equipment, Furniture and Tools <50k": "Construction Items",
    "Computer Software": "Construction Items",
    "Temporary Facility": "Construction Items",
    Bidding: "Construction Items",
  };

  return categoryMappings[formslyItemCategory] || formslyItemCategory;
};

export const getJiraRequestingProjectSite = (formslyItemCategory: string) => {
  const categoryMappings: Record<string, string> = {
    "BATCHING PLANT": "BATCHING PLANT",
    "CENTRAL OFFICE": "CENTRAL OFFICE",
    "PLANTS AND EQUIPMENT - CEY": "PLANTS AND EQUIPMENT - CEY",
    "ALAMINOS YARD": "ALAMINOS YARD",
    "BALINGASAG YARD": "BALINGASAG YARD",
    "PILILIA YARD": "PILILIA YARD",
    "SANTISIMO YARD": "SANTISIMO YARD",
    "MORONG CRUSHING PLANT": "MORONG CRUSHING PLANT",
    "LUZ-12-051 CATUIRAN": "LUZ-12-051 CATUIRAN",
    "LUZ-14-041B VALENZUELA PLANT 2": "LUZ-14-041B VALENZUELA PLANT 2",
    "LUZ-14-046 PASIG PACKAGE 1A": "LUZ-14-046 PASIG PACKAGE 1A",
    "LUZ-15-073  TUGUEGARAO-LAL-LO": "LUZ-15-073  TUGUEGARAO-LAL-LO",
    "LUZ-16-015  LA MESA WTP1": "LUZ-16-015  LA MESA WTP1",
    "LUZ-18-003 MARIVELES 500 KV": "LUZ-18-003 MARIVELES 500 KV",
    "LUZ-18-006 25MLD MORONG BULK": "LUZ-18-006 25MLD MORONG BULK",
    "SOUTH LUZON EXPRESSWAY": "LUZ-18-007A STE TR4 PACKAGE C",
    "LUZ-18-018 SUMITOMO NSCR": "LUZ-18-018 SUMITOMO NSCR",
    "LUZ-18-033 SFEXWIDENING": "LUZ-18-033 SFEXWIDENING",
    "LUZ-18-028 MY SAN VARIOUS": "LUZ-18-028 MY SAN VARIOUS",
    "LUZ-19-002 SRE 40MLD MAGDIWANG": "LUZ-19-002 SRE 40MLD MAGDIWANG",
    "MERALCO HDD": "LUZ-19-021 MERALCO HDD PROJECT",
    "MARILAO EHV": "LUZ-20-001 500KVA MARILAO",
    "LUZ-20-002 MERALCO HDD 2": "LUZ-20-002 MERALCO HDD 2",
    "LUZ-19-016 L1CEP CPYPAR": "LUZ-19-016 L1CEP CPYPAR",
    "LUZ-20-003 ILIJAN": "LUZ-20-003 ILIJAN",
    "KIANGAN HEPP": "LUZ-21-002 KIANGAN",
    "LUZ-21-006 UPPER WAWA DAM": "LUZ-21-006 UPPER WAWA DAM",
    BCPP: "LUZ-21-007 ILIJAN CCPP",
    TUMAUINI: "LUZ-21-009 TUMAUINI HEPPP",
    "HERMOSA SAN JOSE TRANSMISSION LINE": "LUZ-21-011 HERMOSA 500KV TL",
    "LUZ-21-012 160MW BALAOI WPP": "LUZ-21-012 160MW BALAOI WPP",
    "LUZ-22-001 PNR TRP 01": "LUZ-22-001 PNR TRP 01",
    "LUZ-22-002 500KV BACKBONE S2": "LUZ-22-002 500KV BACKBONE S2",
    "LUZ-22-004 MERALCO HDD 3": "LUZ-22-004 MERALCO HDD 3",
    HUDSON: "LUZ-22-005 HUDSON PACKAGE 1",
    "SOLID LF": "LUZ-22-009 SOLID LF MAIN BLDG",
    "PHILIP MORRIS": "LUZ-22-010 PHILIP MORRIS",
    "LUZ-22-011 HDD LONGOS": "LUZ-22-011 HDD LONGOS",
    CAPARISPISAN: "LUZ-22-012A CAPARISPISAN",
    "HUDSON 2": "LUZ-23-001 HUDSON PACKAGE 2",
    "LUZ-23-002 EAST BAY 200MLD WTP": "LUZ-23-002 EAST BAY 200MLD WTP",
    "MORONG PARK": "LUZ-23-003 MORONG PARK",
    "MRT 7": "LUZ-23-005 MRT 7 NORTH AVE",
    "MANOLO YARD": "MIN-14-026B MANOLO",
    "SIGUIL HYDRO": "MIN-15-077  MW SIGUIL HYDRO",
    "LAKE MAINIT": "MIN-18-036 LAKEMAINIT",
    "MALITBOG SILOO HYDRO ELECTRIC POWER PLANT":
      "MIN-19-027 MALITBOG MINI HYDRO",
    MANGIMA: "MIN-21-005 12MW MANGIMA HPP",
    "MAT I HYDRO ELECTRIC POWER PLANT": "MIN-21-015 MATI-1",
    "CLARIN HEPP": "MIN-21-016 CLARIN",
    "DAVAO BULK": "MIN-22-006 DAVAO HYDRO & BW",
    "MIN-22-007 ZAMBOANGA RADAR": "MIN-22-007 ZAMBOANGA RADAR",
    "MALADUGAO HYDRO": "MIN-22-008 MALADUGAO HEPP",
    "VIZ-22-003 LOBOC 2": "VIZ-22-003 LOBOC 2",
    "X'WELL": "X'WELL",
    NECO: "NECO",
    KRAH: "KRAH",
  };

  return categoryMappings[formslyItemCategory] || formslyItemCategory;
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

  if (sourcingItemCategory === "no match") {
    console.error(
      "Request item category does not match Jira Sourcing Item Category"
    );
    throw Error(
      "Request item category does not match Jira Sourcing Item Category"
    );
  }

  const jiraRequestingProjectSite = getJiraRequestingProjectSite(projectName);

  if (!jiraRequestingProjectSite) {
    console.error(
      "Project site not found in Jira_Requesting_Project_Site_List"
    );
    throw Error("Project site not found in Jira_Requesting_Project_Site_List");
  }

  return {
    fields: {
      project: {
        id: "10031",
        key: "SCSM",
      },
      summary: `${
        process.env.NODE_ENV === "development" ? "(Dev Test) " : ""
      }Request Form for Notation`,
      issuetype: {
        name: "Sourcing",
      },
      reporter: {
        accountId: "712020:aae076f5-c5d1-4e92-82fe-acb5ada4bc7c", // SCIC Dev Jira Account
      },
      customfield_10102: {
        value: jiraRequestingProjectSite,
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
