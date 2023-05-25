import { SectionWithField } from "./types";

export type SectionWithFieldArrayId = {
  id: string;
} & SectionWithField;

export type QuestionWithFieldArrayId = {
  id: string;
} & QuestionWithChoices;

export type ChoiceWithFieldArrayId = {
  id: string;
} & Options;
