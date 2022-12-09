import { Database } from "./database.types";

export type { Database } from "./database.types";

// user_profile_table
export type UserProfileTableRow =
  Database["public"]["Tables"]["user_profile_table"]["Row"];
export type UserProfileTableInsert =
  Database["public"]["Tables"]["user_profile_table"]["Insert"];
export type UserProfileTableUpdate =
  Database["public"]["Tables"]["user_profile_table"]["Update"];

// team_table
export type TeamTableRow = Database["public"]["Tables"]["team_table"]["Row"];
export type TeamTableInsert =
  Database["public"]["Tables"]["team_table"]["Insert"];
export type TeamTableUpdate =
  Database["public"]["Tables"]["team_table"]["Update"];

// team_role_table
export type TeamRoleTableRow =
  Database["public"]["Tables"]["team_role_table"]["Row"];
export type TeamRoleTableInsert =
  Database["public"]["Tables"]["team_role_table"]["Insert"];
export type TeamRoleTableUpdate =
  Database["public"]["Tables"]["team_role_table"]["Update"];

// form_table
export type FormTableRow = Database["public"]["Tables"]["form_table"]["Row"];
export type FormTableInsert =
  Database["public"]["Tables"]["form_table"]["Insert"];
export type FormTableUpdate =
  Database["public"]["Tables"]["form_table"]["Update"];

// field_table
export type FieldTableRow = Database["public"]["Tables"]["field_table"]["Row"];
export type FieldTableInsert =
  Database["public"]["Tables"]["field_table"]["Insert"];
export type FieldTableUpdate =
  Database["public"]["Tables"]["field_table"]["Update"];

// review_table
export type ReviewTableRow =
  Database["public"]["Tables"]["review_table"]["Row"];
export type ReviewTableInsert =
  Database["public"]["Tables"]["review_table"]["Insert"];
export type ReviewTableUpdate =
  Database["public"]["Tables"]["review_table"]["Update"];

// review_response_table
export type ReviewResponseTableRow =
  Database["public"]["Tables"]["review_response_table"]["Row"];
export type ReviewResponseTableInsert =
  Database["public"]["Tables"]["review_response_table"]["Insert"];
export type ReviewResponseTableUpdate =
  Database["public"]["Tables"]["review_response_table"]["Update"];

// request_table
export type RequestTableRow =
  Database["public"]["Tables"]["request_table"]["Row"];
export type RequestTableInsert =
  Database["public"]["Tables"]["request_table"]["Insert"];
export type RequestTableUpdate =
  Database["public"]["Tables"]["request_table"]["Update"];

// request_response_table
export type RequestResponseTableRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];
export type RequestResponseTableInsert =
  Database["public"]["Tables"]["request_response_table"]["Insert"];
export type RequestResponseTableUpdate =
  Database["public"]["Tables"]["request_response_table"]["Update"];

// Enums
export type FieldTypeEnum = Database["public"]["Enums"]["field_type"];
export type FormTypeEnum = Database["public"]["Enums"]["form_type"];
export type RequestStatusEnum = Database["public"]["Enums"]["request_status"];
export type ReviewTypeEnum = Database["public"]["Enums"]["review_type"];
export type TeamRoleEnum = Database["public"]["Enums"]["team_role"];
