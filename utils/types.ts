import { Database } from "./database.types";

export type { Database } from "./database.types";

// user_profile_table
export type UserProfileTableRow =
  Database["public"]["Tables"]["user_profile_table"]["Row"];
export type UserProfileTableInsert =
  Database["public"]["Tables"]["user_profile_table"]["Insert"];
export type UserProfileTableUpdate =
  Database["public"]["Tables"]["user_profile_table"]["Update"];

export type FormRow = Database["public"]["Tables"]["form_table"]["Row"];
export type FormInsert = Database["public"]["Tables"]["form_table"]["Insert"];
export type FormUpdate = Database["public"]["Tables"]["form_table"]["Update"];

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

export type RequestRow = Database["public"]["Tables"]["request_table"]["Row"];
export type RequestInsert =
  Database["public"]["Tables"]["request_table"]["Insert"];
export type RequestUpdate =
  Database["public"]["Tables"]["request_table"]["Update"];
export type TeamMember = Database["public"]["Tables"]["team_role_table"]["Row"];

export type FieldRow = Database["public"]["Tables"]["field_table"]["Row"];
export type RequestResponseRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];

export type UserProfileRow =
  Database["public"]["Tables"]["user_profile_table"]["Row"];

export type RequestType = RequestRow & { approver: UserProfileRow } & {
  owner: UserProfileRow;
};

export type Marks = {
  value: number;
  label: string;
};

export type RequestFields = RequestResponseRow & { field: FieldRow };
// request_response_table
export type RequestResponseTableRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];
export type RequestResponseTableInsert =
  Database["public"]["Tables"]["request_response_table"]["Insert"];
export type RequestResponseTableUpdate =
  Database["public"]["Tables"]["request_response_table"]["Update"];

// team_invitation_table
export type TeamInvitationTableRow =
  Database["public"]["Tables"]["team_invitation_table"]["Row"];
export type TeamInvitationTableInsert =
  Database["public"]["Tables"]["team_invitation_table"]["Insert"];
export type TeamInvitationTableUpdate =
  Database["public"]["Tables"]["team_invitation_table"]["Update"];

// user_notification_table
export type UserNotificationTableRow =
  Database["public"]["Tables"]["user_notification_table"]["Row"];
export type UserNotificationTableInsert =
  Database["public"]["Tables"]["user_notification_table"]["Insert"];
export type UserNotificationTableUpdate =
  Database["public"]["Tables"]["user_notification_table"]["Update"];

// request_comment_table
export type RequestCommentTableRow =
  Database["public"]["Tables"]["request_comment_table"]["Row"];
export type RequestCommentTableInsert =
  Database["public"]["Tables"]["request_comment_table"]["Insert"];
export type RequestCommentTableUpdate =
  Database["public"]["Tables"]["request_comment_table"]["Update"];

// Enums
export type FieldTypeEnum = Database["public"]["Enums"]["field_type"];
export type FormTypeEnum = Database["public"]["Enums"]["form_type"];
export type RequestStatusEnum = Database["public"]["Enums"]["request_status"];
export type TeamRoleEnum = Database["public"]["Enums"]["team_role"];

// Database Functions
export type CheckIfInvitationIsValidArgs =
  Database["public"]["Functions"]["check_if_invitation_is_valid"]["Args"];
export type CheckIfInvitationIsValidReturns =
  Database["public"]["Functions"]["check_if_invitation_is_valid"]["Returns"];
export type GetUserIdListFromEmailListArgs =
  Database["public"]["Functions"]["get_user_id_list_from_email_list"]["Args"];
export type GetUserIdListFromEmailListReturns =
  Database["public"]["Functions"]["get_user_id_list_from_email_list"]["Returns"];

// * Others

// * Build Request Form
export type QuestionRow = { question: string; expected_response_type: string };
export type QuestionOption = {
  value: string;
};
export type FormQuestion = {
  fieldId?: number;
  isRequired: boolean;
  fieldTooltip?: string;
  data: QuestionRow;
  option?: QuestionOption[];
};
export type FormRequest = {
  form_id?: number;
  form_name: string;
  questions: FormQuestion[];
};
