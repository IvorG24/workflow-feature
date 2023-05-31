import { RequestSigner } from "@/components/FormBuilder/SignerSection";
import { v4 as uuidv4 } from "uuid";
import { SectionWithField } from "./types";

export const DEFAULT_REQUEST_LIST_LIMIT = 10;
export const DEFAULT_FORM_LIST_LIMIT = 10;
export const NOTIFICATION_LIST_LIMIT = 10;
export const ROW_PER_PAGE = 10;

const sectionId = uuidv4();
export const defaultRequestFormBuilderSection = (
  formId: string
): SectionWithField[] => [
  {
    section_form_id: formId,
    section_id: sectionId,
    section_name: "Section 1",
    section_order: 1,
    section_is_duplicatable: false,
    fields: [
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
      },
    ],
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
