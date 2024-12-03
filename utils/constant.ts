import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { MeetingDetails, MeetingType, SectionWithField } from "./types";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://formsly.io"
    : "http://localhost:3000";

export const ONE_OFFICE_URL =
  process.env.NODE_ENV === "production"
    ? "https://oneoffice.ph"
    : "http://localhost:3001";

export const APP_SOURCE_ID = "d513a2b5-c223-4f7b-a19f-165ad29655ec";

export const DEFAULT_REQUEST_LIST_LIMIT = 13;
export const DEFAULT_TICKET_LIST_LIMIT = 13;
export const DEFAULT_FORM_LIST_LIMIT = 18;
export const DEFAULT_TEAM_MEMBER_LIST_LIMIT = 10;
export const DEFAULT_TEAM_GROUP_LIST_LIMIT = 10;
export const NOTIFICATION_LIST_LIMIT = 10;
export const DEFAULT_NOTIFICATION_LIST_LIMIT = 10;
export const ROW_PER_PAGE = 10;
export const DIALOG_ROW_PER_PAGE = 7;
export const MAX_FILE_SIZE_IN_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
export const MAX_INT = 2147483647;
export const MAX_TEXT_LENGTH = 4000;
export const DEFAULT_NUMBER_SSOT_ROWS = 5;
export const DEFAULT_NUMBER_HR_SSOT_ROWS = 10;
export const DEFAULT_ITEM_ANALYTICS_ROWS = 10;
export const DEFAULT_ON_SCROLL_LIMIT = 10;
export const FETCH_OPTION_LIMIT = 1000;
export const SELECT_OPTION_LIMIT = 1000;
export const TICKET_ADMIN_ANALYTICS_LIMIT = 10;
export const FORMSLY_PRICE_PER_MONTH = 35000;
export const DEFAULT_APPLICATION_LIST_LIMIT = 10;

export const APPLICATION_STATUS_CANCELLED = "CANCELLED";
export const APPLICATION_STATUS_PENDING = "PENDING";

export const MEETING_TYPE_DETAILS: Record<MeetingType, MeetingDetails> = {
  hr_phone_interview: {
    breakDuration: 5,
    duration: 15,
  },
  technical_interview: {
    breakDuration: 5,
    duration: 30,
  },
  trade_test: {
    breakDuration: 5,
    duration: 30,
  },
};

export const unsortableFieldList = [
  "Name",
  "Full Name",
  "Nickname",
  "Contact Number",
  "Email",
  "Assigned HR",
  "Action",
  "Meeting Link",
  "Job Offer Attachment",
  "Job Offer History",
  "Evaluation",
  "Background Investigation",
];

export const READ_ONLY_TICKET_CATEGORY_LIST = [
  "Incident Report for Employees",
  "Bug Report",
];

export const UNHIDEABLE_FORMLY_FORMS = [
  "Subcon",
  "Request For Payment Code",
  "Bill of Quantity",
  "Petty Cash Voucher Balance",
];

export const SLA_LIST = [
  {
    title: "Approver",
    description:
      "Approver SLA track, analyze, and optimize approver response times.",
    href: "/sla/approver",
  },
];

export const REPORT_LIST = [
  {
    title: "Incident Report for Employees",
    description: "Track and analyze report for a user.",
    href: "/report/incident-report",
  },
];

export const UUID_EXP =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

export const SIGN_IN_PAGE_PATH = "/sign-in";
export const CREATE_PASSWORD_PAGE_PATH = "/create-password";
export const DEFAULT_LANDING_PAGE = "/team-requests/dashboard";

export const defaultRequestFormBuilderSection = (
  formId: string
): SectionWithField[] => [
  {
    section_form_id: formId,
    section_id: uuidv4(),
    section_name: "",
    section_order: 1,
    section_is_duplicatable: false,
    fields: [],
  },
];

export const defaultRequestFormBuilderSigners = (
  formId: string
): RequestSigner[] => {
  return [
    {
      signer_id: uuidv4(),
      signer_team_member_id: "",
      signer_action: "",
      signer_is_primary_signer: true,
      signer_form_id: formId,
      signer_order: 1,
    },
  ];
};

export const FORMSLY_GROUP = [
  "OPERATIONS/ENGINEERING",
  "PURCHASER",
  "SITE WAREHOUSE",
  "LEAD INVENTORY CONTROLLER",
  "WAREHOUSE CORPORATE SUPPORT LEAD",
  "TREASURY PROCESSOR",
  "AUDIT PROCESSOR",
];

export const ITEM_PURPOSE_CHOICES = [
  "Major Material (cement, aggregates, ready-mix concerete, rebar, admixture, RC pipe, CHB)",
  "Formworks (all parts and types including accessories)",
  "Office Supplies, Furnitures, and Equipment",
  "Light Equipment & Tools",
  "PPE & Safety Paraphernalia",
  "Subcontractor (supply of labor, materials, fabrication, manufacture, production)",
  "Permanent Materials w/ BAC (line items in BOQ)",
  "IT Equipment",
  "Fuel",
  "Hauling Works",
  "Survey, Calibration & Testing of Instruments",
  "Consumable/Common Materials for Permanent",
  "PED Transactions",
  "Repairs and Maintenance",
  "Other Services",
];

export const ITEM_FIELDS_ORDER = [
  "Requesting Project",
  "Type",
  "Date Needed",
  "Purpose",
];

// Common image file extensions
export const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".svg",
];

// Common PDF file extensions
export const pdfExtensions = [".pdf"];

// Common document file extensions
export const documentExtensions = [
  ".doc",
  ".docx",
  ".txt",
  ".rtf",
  ".odt",
  ".csv",
  ".xlsx",
];

// Common audio and video file extensions
export const mediaExtensions = [
  ".mp4",
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".avi",
];

export const GL_ACCOUNT_CHOICES = [
  "Formworks Accessories",
  "Construction Materials",
  "Spare Parts & Supplies",
  "Uniform and Safety Paraphernalia",
  "Fuel, Oil, Lubricants",
  "Office Supplies & Stationeries",
  "Miscellaneous Supplies",
  "Fixed Asset - Construction Equipment, Machinery and Tools",
  "Fixed Asset - Transportation Equipment",
  "Fixed Asset - Office Machine and Equipment",
  "Fixed Asset - Low Value Asset >50k",
  "Minor Equipment, Furniture and Tools <50k",
  "Computer Software",
  "Temporary Facility",
  "Bidding",
];

export const FORM_SEGMENT_CHOCIES = [
  { label: "Form Preview", value: "Form Preview" },
  { label: "Form Details", value: "Form Details" },
  { label: "Form Lookup", value: "Form Lookup" },
];

export const formatDate = (dateValue: Date) => {
  return moment(dateValue).format("YYYY-MM-DD");
};

export const formatTime = (timeValue: Date) => {
  return moment(timeValue).format("LT");
};

export const formatDateTime = (dateTimeValue: string | Date | number) => {
  return moment(dateTimeValue).format("YYYY-MM-DD LT");
};

export const ID_OPTIONS = [
  {
    value: "Company ID",
    label: "Company ID",
  },
  {
    value: "Pag-IBIG",
    label: "Pag-IBIG",
  },
  {
    value: "PhilHealth",
    label: "PhilHealth",
  },
  {
    value: "Philippine Driver's License",
    label: "Philippine Driver's License",
  },
  {
    value: "Philippine Identification (PhilID) / ePhilID",
    label: "Philippine Identification (PhilID) / ePhilID",
  },
  {
    value: "Philippine Passport",
    label: "Philippine Passport",
  },
  {
    value: "SSS",
    label: "SSS",
  },
  {
    value: "Unified Multi-Purpose Identification (UMID) Card",
    label: "Unified Multi-Purpose Identification (UMID) Card",
  },
];

export const createTicketFilePlaceholder = (url: string) => {
  const urlArray = `${url}`.split("___");
  const fileName = urlArray[urlArray.length - 2].replace("%20", " ");
  const fileContent = "temporary";
  return new File([fileContent], fileName);
};

export const generateYearList = (
  startYear = 2000,
  endYear = 2050
): string[] => {
  const years: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }
  return years;
};

export const generateMonthList = (): string[] => {
  const months: string[] = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    date.setMonth(i);
    months.push(date.toLocaleString(undefined, { month: "long" }));
  }
  return months;
};

export const ITEM_FIELD_ID_LIST = [
  "51b6da24-3e28-49c4-9e19-5988b9ad3909",
  "6882287e-57c7-42ae-a672-b0d6c8979b01",
  "46dc154d-1c35-4a3c-9809-698b56d17faa",
  "c08820a5-592a-4bf9-9528-97b7ee7be94b",
  "b2c899e8-4ac7-4019-819e-d6ebcae71f41",
  "c3efa89d-8297-4920-8c3e-d9dee61fdf13",
  "d78145e8-ba83-4fa8-907f-db66fd3cae0d",
  "440d9a37-656a-4237-be3b-c434f512eaa9",
  "a6266f0b-1339-4c50-910e-9bae73031df0",
  "0c9831e7-dc18-4aaf-87f7-2e7bcbc53eae",
  "64bb5899-bad4-4fe4-bc08-60dce9923f57",
  "8fdb158b-bed5-4eac-a6dc-bc69275f1ac7",
  "b69182a9-dc96-472b-aa31-b1f2f92ec78b",
  "159c86c3-dda6-4c8a-919f-50e1674659bd",
];

export const PED_ITEM_FIELD_ID_LIST = [
  "b93e3160-4f07-4b70-98bc-f84a372bd54c",
  "cf80d363-be97-4fb3-a91f-4fb9a0616b67",
  "20d9159a-c410-4e4b-8c21-c02e44d8f1e9",
  "218b70f8-7a3b-49a4-91c8-04567500812f",
  "53df2b33-9d35-4a15-b13d-431940738c68",
  "5f8d6c56-cac1-4756-8419-8aa8998bf8ed",
  "5eed4963-e011-4a1e-a03c-a901636d0dfa",
  "9638fdb6-4f8a-41cf-bf26-68b94f479a51",
  "7971912e-bdea-4820-9e1d-ff501296a62c",
  "c81706d5-bebf-4ffd-813b-71f57b219de5",
  "137bbd25-2f65-4b65-86e7-7f5726857084",
];

export const IT_ASSET_FIELD_ID_LIST = [
  "e638e010-44e8-4060-b065-e624fc5f1ab9",
  "7b0354fd-3f42-4c32-bed2-2f08231b168c",
  "58de3cd4-4a3c-4422-9d27-c57f173a3a3e",
  "f16c09d6-b9b7-4e77-a276-028537ec4e6a",
  "5c903026-b913-4071-a7a3-cb7ee9ee907f",
  "bbf26ed6-8e28-4249-b4ef-173a8255d231",
  "20251c66-fa30-4fce-bb06-87c5e9a891ed",
  "1a7001b7-e2d5-4469-9382-a49e74102ebb",
  "8a14bffe-2672-4a99-9943-9d7e6a7a15fa",
  "59c6b617-b0b5-4ecd-b9b5-7d7072098511",
  "6cff0df1-aed7-4ecc-a40f-25371649581d",
  "83556f5a-150d-473f-ae5a-bfe3c084a4eb",
  "8e25ccba-eb60-4a8c-965b-c77f81b66795",
  "85a78a9f-d0cd-45d5-b781-c909efab5769",
  "60b17659-6f6e-4719-99f1-47bed94fe7a8",
  "7313a52b-a131-4e93-ae97-f806acc1534f",
  "f2ac0b86-c483-435c-abda-08bf310e570b",
  "cfdba656-ad4f-4bec-9541-96d9fbfcf03f",
];

export const TECHNICAL_ASSESSMENT_FIELD_LIST = [
  "226b0080-b9bf-423e-ba3a-87132dfa9c6a",
  "4858119a-9f7a-423b-8130-7f1a69f3c296",
  "72abb19c-ac74-4378-941a-e4e64cf4f39e",
  "ab67c29a-b82b-4012-b74e-c99fe3444ab1",
  "c54ad877-222f-4e01-a77a-dd50a5839c12",
  "362bff3d-54fa-413b-992c-fd344d8552c6",
  "ef1e47d2-413f-4f92-b541-20c88f3a67b2",
  "ce73bb3c-e3f3-4257-a546-d079dea4cfc5",
  "f5f904e3-a13b-4369-a942-e686486dc827",
  "1653cdf2-08e6-4a3a-8280-55a7bd7de486",
  "8ff15d7e-c015-4ba1-8e16-59f5e47ffa67",
  "fc32500d-62df-4b3c-84be-238c7fb374c9",
  "a30ea8a0-ccd4-4e9c-8492-2487aad74cca",
];

export const PRACTICAL_TEST_FIELD_LIST = [
  "1f2344f9-a491-451c-85d5-43e4c2a24203",
  "301597ab-6d83-42d5-b0a6-45d80eb6d3b8",
  "57facce9-cfe9-4e24-8c6d-318b7bf86d4e",
  "c4dc4d86-1b97-4626-a2e4-ddde0f8aef29",
  "c92617dc-01b5-456a-a6af-a24406349e2a",
  "f531109d-7804-4ce8-b158-cc24ba12be06",
  "9d6f8b4d-e530-4bbc-8554-0512146eacaa",
  "070cf161-c3b9-4f01-b844-841e522f4800",
  "488dc9a5-a6a8-4e41-8e61-d12ec0690c8b",
];

export const DAYS_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

export const INTERVAL_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const CSI_HIDDEN_FIELDS = [
  "CSI Code Description",
  "CSI Code",
  "Division Description",
  "Level 2 Major Group Description",
  "Level 2 Minor Group Description",
  "CSI Division",
];

export const ALLOWED_USER_TO_EDIT_LRF_REQUESTS =
  "accounting.ca@staclara.com.ph";

export const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

// projects that does not require cost code
export const costCodeExemptionList = [
  "YARD",
  "CENTRAL OFFICE",
  "SANTISIMO LOGISTICS",
  "BATCHING PLANT",
];
