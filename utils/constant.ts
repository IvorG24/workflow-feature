import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 13;
export const DEFAULT_FORM_LIST_LIMIT = 10;
export const DEFAULT_TEAM_MEMBER_LIST_LIMIT = 10;
export const DEFAULT_TEAM_GROUP_LIST_LIMIT = 10;
export const NOTIFICATION_LIST_LIMIT = 10;
export const DEFAULT_NOTIFICATION_LIST_LIMIT = 10;
export const ROW_PER_PAGE = 10;
export const MAX_FILE_SIZE_IN_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
export const DEFAULT_NUMBER_SSOT_ROWS = 10;

export const UNHIDEABLE_FORMLY_FORMS = [
  "Quotation",
  "Receiving Inspecting Report (Purchased)",
  "Receiving Inspecting Report (Sourced)",
  "Cheque Reference",
  "Sourced Order to Purchase",
];

export const SIGN_IN_PAGE_PATH = "/sign-in";
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
  const orderToPurchaseFormId = uuidv4();
  const sourcedOrderToPurchaseFormId = uuidv4();
  const quotationFormId = uuidv4();
  const receivingInspectingReportPurchasedFormId = uuidv4();
  const receivingInspectingReportSourcedFormId = uuidv4();
  const chequeReferenceFormId = uuidv4();
  const auditFormId = uuidv4();

  // section ids
  const otpIdSectionId = uuidv4();
  const otpMainSectionId = uuidv4();
  const otpItemSectionId = uuidv4();
  const sourcedOtpItemSectionId = uuidv4();
  const quotationIdSectionId = uuidv4();
  const quotationMainSectionId = uuidv4();
  const quotationAdditionalChargeSectionId = uuidv4();
  const quotationItemSectionId = uuidv4();
  const rirPurchasedIdSectionId = uuidv4();
  const rirPurchasedQualityCheckSectionId = uuidv4();
  const rirPurchasedItemSectionId = uuidv4();
  const rirSourcedIdSectionId = uuidv4();
  const rirSourcedQualityCheckSectionId = uuidv4();
  const rirSourcedItemSectionId = uuidv4();
  const chequeReferenceIdSectionId = uuidv4();
  const chequeReferenceTreasurySectionId = uuidv4();
  const chequeReferenceChequeSectionId = uuidv4();
  const auditMainSectionId = uuidv4();

  // field ids
  const otpTypeFieldId = uuidv4();
  const quotationRequestSendMethodId = uuidv4();
  const chequeReferenceTreasuryStatusFieldId = uuidv4();
  const auditRowCheckFieldId = uuidv4();

  const formData = {
    orderToPurchase: {
      form: {
        form_id: orderToPurchaseFormId,
        form_name: "Order to Purchase",
        form_description: "formsly premade Order to Purchase form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: otpIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: orderToPurchaseFormId,
        },
        {
          section_id: otpMainSectionId,
          section_name: "Main",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: orderToPurchaseFormId,
        },
        {
          section_id: otpItemSectionId,
          section_name: "Item",
          section_order: 3,
          section_is_duplicatable: true,
          section_form_id: orderToPurchaseFormId,
        },
      ],
      field: [
        {
          field_name: "Parent OTP ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: otpIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Project Name",
          field_type: "DROPDOWN",
          field_order: 2,
          field_section_id: otpMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Date Needed",
          field_type: "DATE",
          field_order: 4,
          field_section_id: otpMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "General Name",
          field_type: "DROPDOWN",
          field_order: 5,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Unit of Measurement",
          field_type: "TEXT",
          field_order: 6,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cost Code",
          field_type: "TEXT",
          field_order: 8,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "GL Account",
          field_type: "TEXT",
          field_order: 9,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
      option: [
        {
          option_value: "Cash Purchase - Advance Payment",
          option_order: 1,
          option_field_id: otpTypeFieldId,
        },
        {
          option_value: "Cash Purchase - Local Purchase",
          option_order: 2,
          option_field_id: otpTypeFieldId,
        },
        {
          option_value: "Order to Purchase",
          option_order: 3,
          option_field_id: otpTypeFieldId,
        },
      ],
    },
    sourcedOrderToPurchase: {
      form: {
        form_id: sourcedOrderToPurchaseFormId,
        form_name: "Sourced Order to Purchase",
        form_description: "formsly premade Sourced Order to Purchase form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: true,
      },
      section: [
        {
          section_id: sourcedOtpItemSectionId,
          section_name: "Item",
          section_order: 1,
          section_is_duplicatable: true,
          section_form_id: sourcedOrderToPurchaseFormId,
        },
      ],
      field: [
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: sourcedOtpItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 2,
          field_section_id: sourcedOtpItemSectionId,
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
          field_name: "Order to Purchase ID",
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
          field_name: "Delivery Fee",
          field_type: "NUMBER",
          field_order: 6,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Bank Charge",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Mobilization Charge",
          field_type: "NUMBER",
          field_order: 8,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Demobilization Charge",
          field_type: "NUMBER",
          field_order: 9,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Freight Charge",
          field_type: "NUMBER",
          field_order: 10,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Hauling Charge",
          field_type: "NUMBER",
          field_order: 11,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Handling Charge",
          field_type: "NUMBER",
          field_order: 12,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Packing Charge",
          field_type: "NUMBER",
          field_order: 13,
          field_section_id: quotationAdditionalChargeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 14,
          field_section_id: quotationItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Price per Unit",
          field_type: "NUMBER",
          field_order: 15,
          field_section_id: quotationItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 16,
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
      ],
    },
    receivingInspectingReportPurchased: {
      form: {
        form_id: receivingInspectingReportPurchasedFormId,
        form_name: "Receiving Inspecting Report (Purchased)",
        form_description:
          "formsly premade Receiving Inspecting Report (Purchased) form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: rirPurchasedIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportPurchasedFormId,
        },
        {
          section_id: rirPurchasedQualityCheckSectionId,
          section_name: "Quality Check",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportPurchasedFormId,
        },
        {
          section_id: rirPurchasedItemSectionId,
          section_name: "Item",
          section_order: 3,
          section_is_duplicatable: true,
          section_form_id: receivingInspectingReportPurchasedFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: rirPurchasedIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Quotation ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: rirPurchasedIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "DR",
          field_type: "FILE",
          field_order: 3,
          field_section_id: rirPurchasedQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "SI",
          field_type: "FILE",
          field_order: 4,
          field_section_id: rirPurchasedQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 5,
          field_section_id: rirPurchasedItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 6,
          field_section_id: rirPurchasedItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Receiving Status",
          field_type: "TEXT",
          field_order: 7,
          field_section_id: rirPurchasedItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
    },
    receivingInspectingReportSourced: {
      form: {
        form_id: receivingInspectingReportSourcedFormId,
        form_name: "Receiving Inspecting Report (Sourced)",
        form_description:
          "formsly premade Receiving Inspecting Report (Sourced) form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: rirSourcedIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportSourcedFormId,
        },
        {
          section_id: rirSourcedQualityCheckSectionId,
          section_name: "Quality Check",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportSourcedFormId,
        },
        {
          section_id: rirSourcedItemSectionId,
          section_name: "Item",
          section_order: 3,
          section_is_duplicatable: true,
          section_form_id: receivingInspectingReportSourcedFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: rirSourcedIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "DR",
          field_type: "FILE",
          field_order: 2,
          field_section_id: rirSourcedQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "SI",
          field_type: "FILE",
          field_order: 3,
          field_section_id: rirSourcedQualityCheckSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Item",
          field_type: "DROPDOWN",
          field_order: 4,
          field_section_id: rirSourcedItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 5,
          field_section_id: rirSourcedItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Receiving Status",
          field_type: "TEXT",
          field_order: 6,
          field_section_id: rirSourcedItemSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
      ],
    },
    chequeReference: {
      form: {
        form_id: chequeReferenceFormId,
        form_name: "Cheque Reference",
        form_description: "formsly premade Cheque Reference form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: chequeReferenceIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: chequeReferenceFormId,
        },
        {
          section_id: chequeReferenceTreasurySectionId,
          section_name: "Treasury",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: chequeReferenceFormId,
        },
        {
          section_id: chequeReferenceChequeSectionId,
          section_name: "Cheque",
          section_order: 3,
          section_is_duplicatable: false,
          section_form_id: chequeReferenceFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: chequeReferenceIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Cheque Cancelled",
          field_type: "SWITCH",
          field_order: 3,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque Printed Date",
          field_type: "DATE",
          field_order: 4,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque Clearing Date",
          field_type: "DATE",
          field_order: 5,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque First Signatory Name",
          field_type: "TEXT",
          field_order: 6,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque First Date Signed",
          field_type: "DATE",
          field_order: 7,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque Second Signatory Name",
          field_type: "TEXT",
          field_order: 8,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Cheque Second Date Signed",
          field_type: "DATE",
          field_order: 9,
          field_section_id: chequeReferenceChequeSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "No Cheque",
          option_order: 1,
          option_field_id: chequeReferenceTreasuryStatusFieldId,
        },
        {
          option_value: "Ready for Pickup",
          option_order: 2,
          option_field_id: chequeReferenceTreasuryStatusFieldId,
        },
        {
          option_value: "Paid",
          option_order: 3,
          option_field_id: chequeReferenceTreasuryStatusFieldId,
        },
      ],
    },
    audit: {
      form: {
        form_id: auditFormId,
        form_name: "Audit",
        form_description: "formsly premade Audit form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
        form_is_disabled: false,
      },
      section: [
        {
          section_id: auditMainSectionId,
          section_name: "Main",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: auditFormId,
        },
      ],
      field: [
        {
          field_name: "Audit Remarks",
          field_type: "TEXTAREA",
          field_order: 2,
          field_section_id: auditMainSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Date Audit Work Complete",
          field_type: "DATE",
          field_order: 3,
          field_section_id: auditMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "Pass",
          option_order: 1,
          option_field_id: auditRowCheckFieldId,
        },
        {
          option_value: "Fail",
          option_order: 2,
          option_field_id: auditRowCheckFieldId,
        },
      ],
    },
  };

  const fieldsWithId = [
    {
      field_id: otpTypeFieldId,
      field_name: "Type",
      field_type: "DROPDOWN",
      field_order: 3,
      field_section_id: otpMainSectionId,
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
      field_id: chequeReferenceTreasuryStatusFieldId,
      field_name: "Treasury Status",
      field_type: "DROPDOWN",
      field_order: 2,
      field_section_id: chequeReferenceTreasurySectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
    {
      field_id: auditRowCheckFieldId,
      field_name: "SSOT PO Prioritization Row Check",
      field_type: "DROPDOWN",
      field_order: 1,
      field_section_id: auditMainSectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
  ];

  const {
    orderToPurchase,
    sourcedOrderToPurchase,
    quotation,
    receivingInspectingReportPurchased,
    receivingInspectingReportSourced,
    chequeReference,
    audit,
  } = formData;

  return {
    forms: [
      orderToPurchase.form,
      sourcedOrderToPurchase.form,
      quotation.form,
      receivingInspectingReportPurchased.form,
      receivingInspectingReportSourced.form,
      chequeReference.form,
      audit.form,
    ],
    sections: [
      ...orderToPurchase.section,
      ...sourcedOrderToPurchase.section,
      ...quotation.section,
      ...receivingInspectingReportPurchased.section,
      ...receivingInspectingReportSourced.section,
      ...chequeReference.section,
      ...audit.section,
    ],
    fieldsWithoutId: [
      ...orderToPurchase.field,
      ...sourcedOrderToPurchase.field,
      ...quotation.field,
      ...receivingInspectingReportPurchased.field,
      ...receivingInspectingReportSourced.field,
      ...chequeReference.field,
      ...audit.field,
    ],
    fieldWithId: fieldsWithId,
    options: [
      ...orderToPurchase.option,
      ...quotation.option,
      ...chequeReference.option,
      ...audit.option,
    ],
  };
};

export const FORMSLY_GROUP = [
  "Warehouse Processor",
  "Accounting Processor",
  "Warehouse Receiver",
  "Treasury Processor",
  "Audit Processor",
];

export const ITEM_PURPOSE_CHOICES = [
  "Major Material (cement, aggregates, ready-mix concerete, rebar, admixture, RC pipe, CHB)",
  "Formworks (all parts and types including accessories)",
  "Temporary Facilities",
  "Office Supplies, Furnitures, and Equipment",
  "Light Equipment & Tools",
  "PPE & Safety Paraphernalia",
  "Subcontractor (supply of labor, materials, fabrication, manufacture, production)",
  "Permanent Materials w/ BAC (line items in BOQ)",
  "Imported Material",
  "IT Equipment",
  "Fuel",
  "Hauling Works",
  "Survey, Calibration & Testing of Instruments",
  "Consumable/Common Materials for Permanent",
  "PED Transactions",
  "Repairs and Maintenance",
  "Other Services",
];

export const ITEM_UNIT_CHOICES = [
  "assy",
  "bag",
  "batch",
  "bank cubic meter",
  "board foot",
  "book",
  "borehole",
  "box",
  "bottle",
  "bucket",
  "bundle",
  "can",
  "cart",
  "carton",
  "cartridge",
  "case",
  "cubic centimeter",
  "coil",
  "container",
  "copy",
  "cubic meter",
  "cylinder",
  "day",
  "dayshift",
  "dolly",
  "dozen",
  "drum",
  "each",
  "elf",
  "film",
  "foundation",
  "foot",
  "gallon",
  "global",
  "hole",
  "hour",
  "inch",
  "jar",
  "joint",
  "kilogram",
  "kit",
  "kilometer",
  "lump sum",
  "linear feet",
  "pound",
  "length",
  "license",
  "line",
  "lumen",
  "lot",
  "liter",
  "megatonne",
  "milliliter",
  "module",
  "month",
  "meter",
  "night shift",
  "number",
  "ounce",
  "pack",
  "pad",
  "pail",
  "pair",
  "panel",
  "piece",
  "person",
  "pint",
  "position",
  "quartz",
  "quarter",
  "ream",
  "rig",
  "roll",
  "sack",
  "sample",
  "sausage",
  "section",
  "set up",
  "set",
  "sheet",
  "shot",
  "spot",
  "square foot",
  "square meter",
  "teraliter",
  "tablet",
  "teeth",
  "test",
  "tin",
  "toner",
  "tower",
  "trip",
  "tube",
  "unipack",
  "unit",
  "visit",
  "week",
  "yard",
];

export const OTP_FIELDS_ORDER = [
  "Parent OTP ID",
  "Project Name",
  "Type",
  "Date Needed",
];
