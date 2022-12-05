import type { Database } from "@/utils/database.types";

type InputTypes = Database["public"]["Enums"]["expected_response_type"];

type Question = Database["public"]["Tables"]["question_table"]["Insert"];

type FormTableInsert = Database["public"]["Tables"]["form_table"]["Insert"];

type QuestionRow = Partial<
  Database["public"]["Tables"]["question_table"]["Row"]
>;

type Option = Partial<
  Database["public"]["Tables"]["user_created_select_option_table"]["Insert"]
>;

type OptionRow =
  Database["public"]["Tables"]["user_created_select_option_table"]["Row"];

type QuestionOption = {
  value: string;
};

type FormQuestion = {
  data: QuestionRow;
  option?: QuestionOption[];
};

type FormRequestData = {
  title: string;
  description: string;
  approver: string;
  review_period: string[];
  default: string;
  questions: FormQuestion[];
};

export type {
  FormRequestData,
  FormQuestion,
  FormTableInsert,
  InputTypes,
  Question,
  QuestionRow,
  QuestionOption,
  Option,
  OptionRow,
};
