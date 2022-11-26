import type { Database } from "@/utils/database.types";

export type InputTypes = Database["public"]["Enums"]["expected_response_type"];

export type Question = Database["public"]["Tables"]["question_table"]["Insert"];

export type QuestionRow = Partial<
  Database["public"]["Tables"]["question_table"]["Row"]
>;

export type Option = Partial<
  Database["public"]["Tables"]["user_created_select_option_table"]["Insert"]
>;

export type OptionRow =
  Database["public"]["Tables"]["user_created_select_option_table"]["Row"];

export type QuestionOption = {
  value: string;
};

export type FormQuestion = {
  data: QuestionRow;
  option?: QuestionOption[];
};

type FormRequest = {
  form_name: string;
  questions: FormQuestion[];
};

export default FormRequest;
