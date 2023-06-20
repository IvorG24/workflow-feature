import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 12;
export const DEFAULT_FORM_LIST_LIMIT = 10;
export const DEFAULT_TEAM_MEMBER_LIST_LIMIT = 10;
export const NOTIFICATION_LIST_LIMIT = 10;
export const DEFAULT_NOTIFICATION_LIST_LIMIT = 10;
export const ROW_PER_PAGE = 10;

export const UNHIDEABLE_FORMLY_FORMS = [
  "Purchase Order",
  "Invoice",
  "Account Payable Voucher",
  "Receiving Inspecting Report",
];

export const FORM_CONNECTION = {
  "Order to Purchase": "Purchase Order",
  "Purchase Order": "Invoice",
  Invoice: "Account Payable Voucher",
  "Account Payable Voucher": "Receiving Inspecting Report",
};

export const SIGN_IN_PAGE_PATH = "/sign-in";
export const DEFAULT_LANDING_PAGE = "/team-requests/requests";

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
  const purchaseOrderFormId = uuidv4();
  const invoiceFormId = uuidv4();
  const accountPayableVoucherFormId = uuidv4();
  const receivingInspectingReportFormId = uuidv4();
  const chequeReferenceFormId = uuidv4();
  const auditFormId = uuidv4();

  // section ids
  const otpMainSectionId = uuidv4();
  const otpItemSectionId = uuidv4();
  const poIdSectionId = uuidv4();
  const poMainSectionId = uuidv4();
  const invoiceIdSectionId = uuidv4();
  const invoiceMainSectionId = uuidv4();
  const apvIdSectionId = uuidv4();
  const rirIdSectionId = uuidv4();
  const rirMainSectionId = uuidv4();
  const chequeReferenceTreasurySectionId = uuidv4();
  const chequeReferenceChequeSectionId = uuidv4();
  const auditMainSectionId = uuidv4();

  // field ids
  const otpTypeFieldId = uuidv4();
  const rirReceivingStatusFieldId = uuidv4();
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
      },
      section: [
        {
          section_id: otpMainSectionId,
          section_name: "Main",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: orderToPurchaseFormId,
        },
        {
          section_id: otpItemSectionId,
          section_name: "Item",
          section_order: 2,
          section_is_duplicatable: true,
          section_form_id: orderToPurchaseFormId,
        },
      ],
      field: [
        {
          field_name: "Project Name",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: otpMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Warehouse Processor",
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
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 6,
          field_section_id: otpItemSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "Cash",
          option_order: 1,
          option_field_id: otpTypeFieldId,
        },
        {
          option_value: "Order to Purchase",
          option_order: 2,
          option_field_id: otpTypeFieldId,
        },
      ],
    },
    purchaseOrder: {
      form: {
        form_id: purchaseOrderFormId,
        form_name: "Purchase Order",
        form_description: "formsly premade Purchase Order form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
      },
      section: [
        {
          section_id: poIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: purchaseOrderFormId,
        },
        {
          section_id: poMainSectionId,
          section_name: "Main",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: purchaseOrderFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: poIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Purchasing Processor",
          field_type: "DROPDOWN",
          field_order: 2,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Vendor",
          field_type: "DROPDOWN",
          field_order: 3,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Quantity",
          field_type: "NUMBER",
          field_order: 4,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Price",
          field_type: "NUMBER",
          field_order: 5,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Remarks",
          field_type: "TEXTAREA",
          field_order: 6,
          field_section_id: poMainSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Payment Terms",
          field_type: "TEXT",
          field_order: 7,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Down Payment Percentage",
          field_type: "NUMBER",
          field_order: 8,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Down Payment Computation",
          field_type: "NUMBER",
          field_order: 9,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Expected Delivery Date",
          field_type: "DATE",
          field_order: 10,
          field_section_id: poMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
    },
    invoice: {
      form: {
        form_id: invoiceFormId,
        form_name: "Invoice",
        form_description: "formsly premade Invoice form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
      },
      section: [
        {
          section_id: invoiceIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: invoiceFormId,
        },
        {
          section_id: invoiceMainSectionId,
          section_name: "Main",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: invoiceFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: invoiceIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Purchase Order ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: invoiceIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Accounting Processor",
          field_type: "DROPDOWN",
          field_order: 3,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Invoice Received Date",
          field_type: "DATE",
          field_order: 4,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Invoice Attachment",
          field_type: "FILE",
          field_order: 5,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Invoice Pay by Date",
          field_type: "DATE",
          field_order: 6,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "Invoice Payable Amount",
          field_type: "NUMBER",
          field_order: 7,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
        {
          field_name: "CV Attachment",
          field_type: "FILE",
          field_order: 8,
          field_section_id: invoiceMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
    },
    accountPayableVoucher: {
      form: {
        form_id: accountPayableVoucherFormId,
        form_name: "Account Payable Voucher",
        form_description: "formsly premade Account Payable Voucher form",
        form_app: "REQUEST",
        form_is_formsly_form: true,
        form_is_hidden: true,
        form_team_member_id: teamMemberId,
      },
      section: [
        {
          section_id: apvIdSectionId,
          section_name: "ID",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: accountPayableVoucherFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: apvIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Purchase Order ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: apvIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Invoice ID",
          field_type: "LINK",
          field_order: 3,
          field_section_id: apvIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
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
          section_id: rirMainSectionId,
          section_name: "Main",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: receivingInspectingReportFormId,
        },
      ],
      field: [
        {
          field_name: "Order to Purchase ID",
          field_type: "LINK",
          field_order: 1,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Purchase Order ID",
          field_type: "LINK",
          field_order: 2,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Invoice ID",
          field_type: "LINK",
          field_order: 3,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Account Payable Voucher ID",
          field_type: "LINK",
          field_order: 4,
          field_section_id: rirIdSectionId,
          field_is_required: true,
          field_is_read_only: true,
        },
        {
          field_name: "Warehouse Receiver",
          field_type: "DROPDOWN",
          field_order: 5,
          field_section_id: rirMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },
      ],
      option: [
        {
          option_value: "Not Received",
          option_order: 1,
          option_field_id: rirReceivingStatusFieldId,
        },
        {
          option_value: "Partially Receive",
          option_order: 2,
          option_field_id: rirReceivingStatusFieldId,
        },
        {
          option_value: "Fully Received",
          option_order: 3,
          option_field_id: rirReceivingStatusFieldId,
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
      },
      section: [
        {
          section_id: chequeReferenceTreasurySectionId,
          section_name: "Treasury",
          section_order: 1,
          section_is_duplicatable: false,
          section_form_id: chequeReferenceFormId,
        },
        {
          section_id: chequeReferenceChequeSectionId,
          section_name: "Cheque",
          section_order: 2,
          section_is_duplicatable: false,
          section_form_id: chequeReferenceFormId,
        },
      ],
      field: [
        {
          field_name: "Treasury Processsor",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: chequeReferenceTreasurySectionId,
          field_is_required: true,
          field_is_read_only: false,
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
          field_name: "Audit Processsor",
          field_type: "DROPDOWN",
          field_order: 1,
          field_section_id: auditMainSectionId,
          field_is_required: true,
          field_is_read_only: false,
        },

        {
          field_name: "Audit Remarks",
          field_type: "TEXTAREA",
          field_order: 3,
          field_section_id: auditMainSectionId,
          field_is_required: false,
          field_is_read_only: false,
        },
        {
          field_name: "Date Audit Work Complete",
          field_type: "DATE",
          field_order: 4,
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
      field_id: rirReceivingStatusFieldId,
      field_name: "Receiving Status",
      field_type: "DROPDOWN",
      field_order: 6,
      field_section_id: rirMainSectionId,
      field_is_required: true,
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
      field_order: 2,
      field_section_id: auditMainSectionId,
      field_is_required: true,
      field_is_read_only: false,
    },
  ];

  const {
    orderToPurchase,
    purchaseOrder,
    invoice,
    accountPayableVoucher,
    receivingInspectingReport,
    chequeReference,
    audit,
  } = formData;

  return {
    forms: [
      orderToPurchase.form,
      purchaseOrder.form,
      invoice.form,
      accountPayableVoucher.form,
      receivingInspectingReport.form,
      chequeReference.form,
      audit.form,
    ],
    sections: [
      ...orderToPurchase.section,
      ...purchaseOrder.section,
      ...invoice.section,
      ...accountPayableVoucher.section,
      ...receivingInspectingReport.section,
      ...chequeReference.section,
      ...audit.section,
    ],
    fieldsWithoutId: [
      ...orderToPurchase.field,
      ...purchaseOrder.field,
      ...invoice.field,
      ...accountPayableVoucher.field,
      ...receivingInspectingReport.field,
      ...chequeReference.field,
      ...audit.field,
    ],
    fieldWithId: fieldsWithId,
    options: [
      ...orderToPurchase.option,
      ...receivingInspectingReport.option,
      ...chequeReference.option,
      ...audit.option,
    ],
  };
};
