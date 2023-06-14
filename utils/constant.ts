import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 10;
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
