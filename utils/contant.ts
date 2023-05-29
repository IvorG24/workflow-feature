import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 10;
export const DEFAULT_FORM_LIST_LIMIT = 10;

const sectionId = uuidv4();
export const defaultRequestFormBuilderSection: SectionWithField[] = [
  {
    section_form_id: uuidv4(),
    section_id: sectionId,
    section_name: "Section 1",
    section_order: 1,
    section_is_duplicatable: false,
    field_table: [
      {
        field_id: uuidv4(),
        field_type: "TEXT",
        field_name: "Question 1",
        field_description: "",
        field_is_positive_metric: true,
        field_is_required: false,
        field_order: 1,
        field_section_id: sectionId,
        options: [],
        field_response: "",
      },
    ],
  },
];

export const defaultRequestFormBuilderSigners: RequestSigner[] = [
  {
    signer_id: uuidv4(),
    signer_username: "",
    signer_user_id: "",
    action: "",
    status: "PENDING",
    is_primary_approver: true,
  },
];
