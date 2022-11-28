import type { Database } from "@/utils/database.types";

type InputTypes = Database["public"]["Enums"]["expected_response_type"];

type Question = Database["public"]["Tables"]["question_table"]["Insert"];

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

type FormRequest = {
  form_name: string;
  questions: FormQuestion[];
};

export type {
  FormRequest,
  FormQuestion,
  InputTypes,
  Question,
  QuestionRow,
  QuestionOption,
  Option,
  OptionRow,
};
