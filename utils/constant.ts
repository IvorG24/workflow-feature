import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 13;
export const DEFAULT_TICKET_LIST_LIMIT = 13;
export const DEFAULT_FORM_LIST_LIMIT = 18;
export const DEFAULT_TEAM_MEMBER_LIST_LIMIT = 10;
export const DEFAULT_TEAM_GROUP_LIST_LIMIT = 10;
export const NOTIFICATION_LIST_LIMIT = 10;
export const DEFAULT_NOTIFICATION_LIST_LIMIT = 10;
export const ROW_PER_PAGE = 10;
export const MAX_FILE_SIZE_IN_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
export const DEFAULT_NUMBER_SSOT_ROWS = 10;
export const DEFAULT_ITEM_ANALYTICS_ROWS = 20;
export const DEFAULT_ON_SCROLL_LIMIT = 10;

export const UNHIDEABLE_FORMLY_FORMS = [
  "Quotation",
  "Receiving Inspecting Report",
  "Release Order",
  "Sourced Item",
  "Transfer Receipt",
  "Subcon",
];

export const SLA_LIST = [
  {
    title: "Signer",
    description:
      "Signer SLA track, analyze, and optimize signer response times.",
    href: "/sla/signer",
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

export const formslyPremadeFormsData = (teamMemberId: string) => {
  // form ids
  const requisitionFormId = uuidv4();
  const sourcedItemFormId = uuidv4();
  const quotationFormId = uuidv4();
  const receivingInspectingReportFormId = uuidv4();
  const releaseOrderFormId = uuidv4();
  const transferReceiptFormId = uuidv4();
  const subconFormId = uuidv4();

  // section ids
  const requisitionMainSectionId = uuidv4();
  const requisitionItemSectionId = uuidv4();
  const sourcedItemIdSectionId = uuidv4();
  const sourcedItemItemSectionId = uuidv4();
  const quotationIdSectionId = uuidv4();
  const quotationMainSectionId = uuidv4();
  const quotationAdditionalChargeSectionId = uuidv4();
  const quotationItemSectionId = uuidv4();
  const rirIdSectionId = uuidv4();
  const rirQualityCheckSectionId = uuidv4();
  const rirItemSectionId = uuidv4();
  const roIdSectionId = uuidv4();
  const roItemSectionId = uuidv4();
  const transferReceiptIdSectionId = uuidv4();
  const transferReceiptQuantityCheckSectionId = uuidv4();
  const transferReceiptItemSectionId = uuidv4();
  const subconMainSectionId = uuidv4();
  const subconServiceSectionId = uuidv4();

  // field ids
  const requisitionTypeFieldId = uuidv4();
  const quotationRequestSendMethodId = uuidv4();
  const quotationPaymentTermsId = uuidv4();
  const subconTypeId = uuidv4();

  const formData = {
    requisition: {
      form: {
        form_id: requisitionFormId,
        form_name: "Requisition",
        form_description: "formsly premade Requisition form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: requisitionMainSectionId,
          section_name: "Main",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: requisitionFormId,
        },
        {
          section_id: requisitionItemSectionId,
          section_name: "Item",
          section_order: 2,
          section_is_duplicatable: true,
          section_form_id: requisitionFormId,
        },
      ],
      field: [
        {
          field_name: "Requesting Project",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: requisitionMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Date Needed",
          field_type: "DATE",
          field_order: 3,
          field_section_id: requisitionMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Purpose",
          field_type: "TEXT",
          field_order: 4,
          field_section_id: requisitionMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "General Name",
          field_type: "DROPDOWN",
          field_order: 5,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Base Unit of Measurement",
          field_type: "TEXT",
          field_order: 6,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "GL Account",
          field_type: "TEXT",
          field_order: 8,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "CSI Code Description",
          field_type: "DROPDOWN",
          field_order: 9,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "CSI Code",
          field_type: "TEXT",
          field_order: 10,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Division Description",
          field_type: "TEXT",
          field_order: 11,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Level 2 Major Group Description",
          field_type: "TEXT",
          field_order: 12,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Level 2 Minor Group Description",
          field_type: "TEXT",
          field_order: 13,
          field_section_id: requisitionItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
      option: [
        {
          option_value: "Cash Purchase - Advance Payment",
          option_order: 1,
          option_field_id: requisitionTypeFieldId,
        },
        {
          option_value: "Cash Purchase - Local Purchase",
          option_order: 2,
          option_field_id: requisitionTypeFieldId,
        },
        {
          option_value: "Order to Purchase",
          option_order: 3,
          option_field_id: requisitionTypeFieldId,
        },
      ],
    },
    sourcedItem: {
      form: {
        form_id: sourcedItemFormId,
        form_name: "Sourced Item",
        form_description: "formsly premade Sourced Item form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: sourcedItemIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: sourcedItemFormId,
        },
        {
          section_id: sourcedItemItemSectionId,
          section_name: "Item",
          section_order: 2,
          section_is_duplicatable: true,
          section_form_id: sourcedItemFormId,
        },
      ],
      field: [
        {
          field_name: "Requisition ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: sourcedItemIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 2,
          field_section_id: sourcedItemItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 3,
          field_section_id: sourcedItemItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Source Project",
          field_type: "DROPDOWN",
          field_order: 4,
          field_section_id: sourcedItemItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
    },
    quotation: {
      form: {
        form_id: quotationFormId,
        form_name: "Quotation",
        form_description: "formsly premade Quotation form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: quotationIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: quotationFormId,
        },
        {
          section_id: quotationMainSectionId,
          section_name: "Main",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: quotationFormId,
        },
        {
          section_id: quotationAdditionalChargeSectionId,
          section_name: "Additional Charges",
          section_order: 3,
          section_is_duplicatable: false,
          section_form_id: quotationFormId,
        },
        {
          section_id: quotationItemSectionId,
          section_name: "Item",
          section_order: 4,
          section_is_duplicatable: true,
          section_form_id: quotationFormId,
        },
      ],
      field: [
        {
          field_name: "Requisition ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: quotationIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Supplier",
          field_type: "DROPDOWN",
          field_order: 2,
          field_section_id: quotationMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Supplier Quotation",
          field_type: "FILE",
          field_order: 3,
          field_section_id: quotationMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Proof of Sending",
          field_type: "FILE",
          field_order: 5,
          field_section_id: quotationMainSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Lead Time",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: quotationMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Required Down Payment",
          field_type: "NUMBER",
          field_order: 8,
          field_section_id: quotationMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Delivery Fee",
          field_type: "NUMBER",
          field_order: 9,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Bank Charge",
          field_type: "NUMBER",
          field_order: 10,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Mobilization Charge",
          field_type: "NUMBER",
          field_order: 11,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Demobilization Charge",
          field_type: "NUMBER",
          field_order: 12,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Freight Charge",
          field_type: "NUMBER",
          field_order: 13,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Hauling Charge",
          field_type: "NUMBER",
          field_order: 14,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Handling Charge",
          field_type: "NUMBER",
          field_order: 15,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Packing Charge",
          field_type: "NUMBER",
          field_order: 16,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 17,
          field_section_id: quotationItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Price per Unit",
          field_type: "NUMBER",
          field_order: 18,
          field_section_id: quotationItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 19,
          field_section_id: quotationItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "Email",
          option_order: 1,
          option_field_id: quotationRequestSendMethodId,
        },
        {
          option_value: "Text",
          option_order: 2,
          option_field_id: quotationRequestSendMethodId,
        },
        {
          option_value: "Other",
          option_order: 3,
          option_field_id: quotationRequestSendMethodId,
        },
        {
          option_value: "7 PDC",
          option_order: 1,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "15 PDC",
          option_order: 2,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "30 PDC",
          option_order: 3,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "45 PDC",
          option_order: 4,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "60 PDC",
          option_order: 5,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "70 PDC",
          option_order: 6,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "90 PDC",
          option_order: 7,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "120 PDC",
          option_order: 8,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "7 UPI",
          option_order: 9,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "15 UPI",
          option_order: 10,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "30 UPI",
          option_order: 11,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "35 UPI",
          option_order: 12,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "45 UPI",
          option_order: 13,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "60 UPI",
          option_order: 14,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "90 UPI",
          option_order: 15,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "120 UPI",
          option_order: 16,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "7 DAYS",
          option_order: 17,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "COD",
          option_order: 18,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "DATED",
          option_order: 19,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "FO3",
          option_order: 20,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "LC",
          option_order: 21,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "PB",
          option_order: 22,
          option_field_id: quotationPaymentTermsId,
        },
        {
          option_value: "TT",
          option_order: 23,
          option_field_id: quotationPaymentTermsId,
        },
      ],
    },
    receivingInspectingReport: {
      form: {
        form_id: receivingInspectingReportFormId,
        form_name: "Receiving Inspecting Report",
        form_description: "formsly premade Receiving Inspecting Report form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: rirIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportFormId,
        },
        {
          section_id: rirQualityCheckSectionId,
          section_name: "Quality Check",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportFormId,
        },
        {
          section_id: rirItemSectionId,
          section_name: "Item",
          section_order: 3,
          section_is_duplicatable: true,
          section_form_id: receivingInspectingReportFormId,
        },
      ],
      field: [
        {
          field_name: "Requisition ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Quotation ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "DR",
          field_type: "FILE",
          field_order: 3,
          field_section_id: rirQualityCheckSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "SI",
          field_type: "FILE",
          field_order: 4,
          field_section_id: rirQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "QCIR",
          field_type: "FILE",
          field_order: 5,
          field_section_id: rirQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 6,
          field_section_id: rirItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: rirItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Receiving Status",
          field_type: "TEXT",
          field_order: 8,
          field_section_id: rirItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
    },
    releaseOrder: {
      form: {
        form_id: releaseOrderFormId,
        form_name: "Release Order",
        form_description: "formsly premade Release Order form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: roIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: releaseOrderFormId,
        },
        {
          section_id: roItemSectionId,
          section_name: "Item",
          section_order: 2,
          section_is_duplicatable: true,
          section_form_id: releaseOrderFormId,
        },
      ],
      field: [
        {
          field_name: "Requisition ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: roIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Sourced Item ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: roIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 3,
          field_section_id: roItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 4,
          field_section_id: roItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Receiving Status",
          field_type: "TEXT",
          field_order: 5,
          field_section_id: roItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Source Project",
          field_type: "TEXT",
          field_order: 6,
          field_section_id: roItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
    },
    transferReceipt: {
      form: {
        form_id: transferReceiptFormId,
        form_name: "Transfer Receipt",
        form_description: "formsly premade Transfer Receipt form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: transferReceiptIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: transferReceiptFormId,
        },
        {
          section_id: transferReceiptQuantityCheckSectionId,
          section_name: "Quantity Check",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: transferReceiptFormId,
        },
        {
          section_id: transferReceiptItemSectionId,
          section_name: "Item",
          section_order: 3,
          section_is_duplicatable: true,
          section_form_id: transferReceiptFormId,
        },
      ],
      field: [
        {
          field_name: "Requisition ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: transferReceiptIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Sourced Item ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: transferReceiptIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Release Order ID",
          field_type: "LINK",
          field_order: 3,
          field_section_id: transferReceiptIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Transfer Shipment",
          field_type: "FILE",
          field_order: 4,
          field_section_id: transferReceiptQuantityCheckSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Transfer Receipt",
          field_type: "FILE",
          field_order: 5,
          field_section_id: transferReceiptQuantityCheckSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 6,
          field_section_id: transferReceiptItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: transferReceiptItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Receiving Status",
          field_type: "TEXT",
          field_order: 8,
          field_section_id: transferReceiptItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Source Project",
          field_type: "TEXT",
          field_order: 9,
          field_section_id: transferReceiptItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
    },
    subcon: {
      form: {
        form_id: subconFormId,
        form_name: "Subcon",
        form_description: "formsly premade Subcon form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: subconMainSectionId,
          section_name: "Main",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: subconFormId,
        },
        {
          section_id: subconServiceSectionId,
          section_name: "Service",
          section_order: 2,
          section_is_duplicatable: true,
          section_form_id: subconFormId,
        },
      ],
      field: [
        {
          field_name: "Requesting Project",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: subconMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Date Needed",
          field_type: "DATE",
          field_order: 2,
          field_section_id: subconMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Purpose",
          field_type: "TEXT",
          field_order: 3,
          field_section_id: subconMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Description of Work",
          field_type: "TEXT",
          field_order: 5,
          field_section_id: subconMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Nominated Subcon",
          field_type: "MULTISELECT",
          field_order: 6,
          field_section_id: subconMainSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Service Name",
          field_type: "DROPDOWN",
          field_order: 7,
          field_section_id: subconServiceSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "Supply and Installation / Supply and Application",
          option_order: 1,
          option_field_id: subconTypeId,
        },
        {
          option_value: "Installation / Application Works / Fabrication only",
          option_order: 2,
          option_field_id: subconTypeId,
        },
        {
          option_value: "Supply and Fabrication",
          option_order: 3,
          option_field_id: subconTypeId,
        },
      ],
    },
  };

  const fieldsWithId = [
    {
      field_id: requisitionTypeFieldId,
      field_name: "Type",
      field_type: "DROPDOWN",
      field_order: 2,
      field_section_id: requisitionMainSectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
    {
      field_id: quotationRequestSendMethodId,
      field_name: "Request Send Method",
      field_type: "DROPDOWN",
      field_order: 4,
      field_section_id: quotationMainSectionId,
      field_is_required: false,
      field_is_read_only: false,
    },
    {
      field_id: quotationPaymentTermsId,
      field_name: "Payment Terms",
      field_type: "DROPDOWN",
      field_order: 6,
      field_section_id: quotationMainSectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
    {
      field_id: subconTypeId,
      field_name: "Type",
      field_type: "DROPDOWN",
      field_order: 4,
      field_section_id: subconMainSectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
  ];

  const {
    requisition,
    sourcedItem,
    quotation,
    receivingInspectingReport,
    releaseOrder,
    transferReceipt,
    subcon,
  } = formData;

  return {
    forms: [
      requisition.form,
      sourcedItem.form,
      quotation.form,
      receivingInspectingReport.form,
      releaseOrder.form,
      transferReceipt.form,
      subcon.form,
    ],
    sections: [
      ...requisition.section,
      ...sourcedItem.section,
      ...quotation.section,
      ...receivingInspectingReport.section,
      ...releaseOrder.section,
      ...transferReceipt.section,
      ...subcon.section,
    ],
    fieldsWithoutId: [
      ...requisition.field,
      ...sourcedItem.field,
      ...quotation.field,
      ...receivingInspectingReport.field,
      ...releaseOrder.field,
      ...transferReceipt.field,
      ...subcon.field,
    ],
    fieldWithId: fieldsWithId,
    options: [...requisition.option, ...quotation.option, ...subcon.option],
  };
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

export const REQUISITION_FIELDS_ORDER = [
  "Requesting Project",
  "Type",
  "Date Needed",
  "Purpose",
];

export const FORMSLY_FORM_ORDER = [
  "Requisition",
  "Sourced Item",
  "Release Order",
  "Transfer Receipt",
  "Quotation",
  "Receiving Inspecting Report",
];

export const JWT_SECRET_KEY =
  "6B03E2CAE99D0C9DEE49BAC2E6B0427E5BE90C34222E845A624904C1CA84D48A";

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
