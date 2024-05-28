import { FieldWithChoices, OptionTableRow, SectionWithField } from "./types";

export type SectionWithFieldArrayId = {
  id: string;
} & SectionWithField;

export type FieldWithFieldArrayId = {
  id: string;
  field_special_field_template_id?: string;
} & FieldWithChoices;

export type OptionWithFieldArrayId = {
  id: string;
} & OptionTableRow;
