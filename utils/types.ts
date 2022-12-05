import type { Database } from "./database.types";

export type { Database } from "./database.types";
export type UserProfile =
  Database["public"]["Tables"]["user_profile_table"]["Row"];

export type FormTable = Database["public"]["Tables"]["form_table"]["Row"];
export type Team = Database["public"]["Tables"]["team_table"]["Row"];

export type UserProfileRow =
  Database["public"]["Tables"]["user_profile_table"]["Row"];
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profile_table"]["Insert"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profile_table"]["Update"];

export type FormNameRow =
  Database["public"]["Tables"]["form_name_table"]["Row"];
export type FormNameInsert =
  Database["public"]["Tables"]["form_name_table"]["Insert"];
export type FormNameUpdate =
  Database["public"]["Tables"]["form_name_table"]["Update"];

export type FormRow = Database["public"]["Tables"]["form_table"]["Row"];
export type FormInsert = Database["public"]["Tables"]["form_table"]["Insert"];
export type FormUpdate = Database["public"]["Tables"]["form_table"]["Update"];

export type FormPriorityRow =
  Database["public"]["Tables"]["form_priority_table"]["Row"];
export type FormPriorityInsert =
  Database["public"]["Tables"]["form_priority_table"]["Insert"];
export type FormPriorityUpdate =
  Database["public"]["Tables"]["form_priority_table"]["Update"];

export type QuestionRow = Database["public"]["Tables"]["question_table"]["Row"];
export type QuestionInsert =
  Database["public"]["Tables"]["question_table"]["Insert"];
export type QuestionUpdate =
  Database["public"]["Tables"]["question_table"]["Update"];

export type ReviewScoreRow =
  Database["public"]["Tables"]["review_score_table"]["Row"];
export type ReviewScoreInsert =
  Database["public"]["Tables"]["review_score_table"]["Insert"];
export type ReviewScoreUpdate =
  Database["public"]["Tables"]["review_score_table"]["Update"];

export type ReviewRow = Database["public"]["Tables"]["review_table"]["Row"];
export type ReviewInsert =
  Database["public"]["Tables"]["review_table"]["Insert"];
export type ReviewUpdate =
  Database["public"]["Tables"]["review_table"]["Update"];

export type TeamRoleRow = Database["public"]["Tables"]["team_table"]["Row"];
export type TeamRoleInsert =
  Database["public"]["Tables"]["team_table"]["Insert"];
export type TeamRoleUpdate =
  Database["public"]["Tables"]["team_table"]["Update"];

export type TeamRow = Database["public"]["Tables"]["team_table"]["Row"];
export type TeamInsert = Database["public"]["Tables"]["team_table"]["Insert"];
export type TeamUpdate = Database["public"]["Tables"]["team_table"]["Update"];

export type SelectOptionRow =
  Database["public"]["Tables"]["user_created_select_option_table"]["Row"];
export type SelectOptionInsert =
  Database["public"]["Tables"]["user_created_select_option_table"]["Insert"];
export type SelectOptionUpdate =
  Database["public"]["Tables"]["user_created_select_option_table"]["Update"];

export type ExpectedResponseType =
  Database["public"]["Enums"]["expected_response_type"];
export type TeamRoleEnum = Database["public"]["Enums"]["team_role"];

export type RequestRow = Database["public"]["Tables"]["request_table"]["Row"];
export type RequestInsert =
  Database["public"]["Tables"]["request_table"]["Insert"];
export type RequestUpdate =
  Database["public"]["Tables"]["request_table"]["Update"];
export type TeamMember = Database["public"]["Tables"]["team_role_table"]["Row"];
