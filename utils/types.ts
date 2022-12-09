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

export type FormRow = Database["public"]["Tables"]["form_table"]["Row"];
export type FormInsert = Database["public"]["Tables"]["form_table"]["Insert"];
export type FormUpdate = Database["public"]["Tables"]["form_table"]["Update"];

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

export type ExpectedResponseType =
  Database["public"]["Enums"]["expected_response_type"];
export type TeamRoleEnum = Database["public"]["Enums"]["team_role"];

export type RequestRow = Database["public"]["Tables"]["request_table"]["Row"];
export type RequestInsert =
  Database["public"]["Tables"]["request_table"]["Insert"];
export type RequestUpdate =
  Database["public"]["Tables"]["request_table"]["Update"];
export type TeamMember = Database["public"]["Tables"]["team_role_table"]["Row"];

export type FieldRow = Database["public"]["Tables"]["field_table"]["Row"];
export type RequestResponseRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];

export type RequestType = RequestRow & { approver: UserProfileRow } & {
  owner: UserProfileRow;
};

export type Marks = {
  value: number;
  label: string;
};

export type RequestFields = RequestResponseRow & { field: FieldRow };
