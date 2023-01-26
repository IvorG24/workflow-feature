import { Database } from "./database.types";

export type { Database } from "./database.types";

// Tables

// invitation_table
export type InvitationTableRow =
  Database["public"]["Tables"]["invitation_table"]["Row"];
export type InvitationTableInsert =
  Database["public"]["Tables"]["invitation_table"]["Insert"];
export type InvitationTableUpdate =
  Database["public"]["Tables"]["invitation_table"]["Update"];

// member_role_table
export type MemberRoleTableRow =
  Database["public"]["Tables"]["member_role_table"]["Row"];
export type MemberRoleTableInsert =
  Database["public"]["Tables"]["member_role_table"]["Insert"];
export type MemberRoleTableUpdate =
  Database["public"]["Tables"]["member_role_table"]["Update"];

// notification_table
export type NotificationTableRow =
  Database["public"]["Tables"]["notification_table"]["Row"];
export type NotificationTableInsert =
  Database["public"]["Tables"]["notification_table"]["Insert"];
export type NotificationTableUpdate =
  Database["public"]["Tables"]["notification_table"]["Update"];

// request_comment_table
export type RequestCommentTableRow =
  Database["public"]["Tables"]["request_comment_table"]["Row"];
export type RequestCommentTableInsert =
  Database["public"]["Tables"]["request_comment_table"]["Insert"];
export type RequestCommentTableUpdate =
  Database["public"]["Tables"]["request_comment_table"]["Update"];

// request_field_table
export type RequestFieldTableRow =
  Database["public"]["Tables"]["request_field_table"]["Row"];
export type RequestFieldTableInsert =
  Database["public"]["Tables"]["request_field_table"]["Insert"];
export type RequestFieldTableUpdate =
  Database["public"]["Tables"]["request_field_table"]["Update"];

// request_form_fact_table
export type RequestFormFactTableRow =
  Database["public"]["Tables"]["request_form_fact_table"]["Row"];
export type RequestFormFactTableInsert =
  Database["public"]["Tables"]["request_form_fact_table"]["Insert"];
export type RequestFormFactTableUpdate =
  Database["public"]["Tables"]["request_form_fact_table"]["Update"];

// request_form_table
export type RequestFormTableRow =
  Database["public"]["Tables"]["request_form_table"]["Row"];
export type RequestFormTableInsert =
  Database["public"]["Tables"]["request_form_table"]["Insert"];
export type RequestFormTableUpdate =
  Database["public"]["Tables"]["request_form_table"]["Update"];

// request_order_table
export type RequestOrderTableRow =
  Database["public"]["Tables"]["request_order_table"]["Row"];
export type RequestOrderTableInsert =
  Database["public"]["Tables"]["request_order_table"]["Insert"];
export type RequestOrderTableUpdate =
  Database["public"]["Tables"]["request_order_table"]["Update"];

// request_request_approver_table
export type RequestRequestApproverTableRow =
  Database["public"]["Tables"]["request_request_approver_table"]["Row"];
export type RequestRequestApproverTableInsert =
  Database["public"]["Tables"]["request_request_approver_table"]["Insert"];
export type RequestRequestApproverTableUpdate =
  Database["public"]["Tables"]["request_request_approver_table"]["Update"];

// request_request_table
export type RequestRequestTableRow =
  Database["public"]["Tables"]["request_request_table"]["Row"];
export type RequestRequestTableInsert =
  Database["public"]["Tables"]["request_request_table"]["Insert"];
export type RequestRequestTableUpdate =
  Database["public"]["Tables"]["request_request_table"]["Update"];

// request_request_user_comment_table
export type RequestRequestUserCommentTableRow =
  Database["public"]["Tables"]["request_request_user_comment_table"]["Row"];
export type RequestRequestUserCommentTableInsert =
  Database["public"]["Tables"]["request_request_user_comment_table"]["Insert"];
export type RequestRequestUserCommentTableUpdate =
  Database["public"]["Tables"]["request_request_user_comment_table"]["Update"];

// request_response_table
export type RequestResponseTableRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];
export type RequestResponseTableInsert =
  Database["public"]["Tables"]["request_response_table"]["Insert"];
export type RequestResponseTableUpdate =
  Database["public"]["Tables"]["request_response_table"]["Update"];

// request_status_table
export type RequestStatusTableRow =
  Database["public"]["Tables"]["request_status_table"]["Row"];
export type RequestStatusTableInsert =
  Database["public"]["Tables"]["request_status_table"]["Insert"];
export type RequestStatusTableUpdate =
  Database["public"]["Tables"]["request_status_table"]["Update"];

// team_invitation_table
export type TeamInvitationTableRow =
  Database["public"]["Tables"]["team_invitation_table"]["Row"];
export type TeamInvitationTableInsert =
  Database["public"]["Tables"]["team_invitation_table"]["Insert"];
export type TeamInvitationTableUpdate =
  Database["public"]["Tables"]["team_invitation_table"]["Update"];

// team_member_table
export type TeamMemberTableRow =
  Database["public"]["Tables"]["team_member_table"]["Row"];
export type TeamMemberTableInsert =
  Database["public"]["Tables"]["team_member_table"]["Insert"];
export type TeamMemberTableUpdate =
  Database["public"]["Tables"]["team_member_table"]["Update"];

// team_table
export type TeamTableRow = Database["public"]["Tables"]["team_table"]["Row"];
export type TeamTableInsert =
  Database["public"]["Tables"]["team_table"]["Insert"];
export type TeamTableUpdate =
  Database["public"]["Tables"]["team_table"]["Update"];

// team_user_notification_table
export type TeamUserNotificationTableRow =
  Database["public"]["Tables"]["team_user_notification_table"]["Row"];
export type TeamUserNotificationTableInsert =
  Database["public"]["Tables"]["team_user_notification_table"]["Insert"];
export type TeamUserNotificationTableUpdate =
  Database["public"]["Tables"]["team_user_notification_table"]["Update"];

// user_profile_table
export type UserProfileTableRow =
  Database["public"]["Tables"]["user_profile_table"]["Row"];
export type UserProfileTableInsert =
  Database["public"]["Tables"]["user_profile_table"]["Insert"];
export type UserProfileTableUpdate =
  Database["public"]["Tables"]["user_profile_table"]["Update"];

// request_action_table
export type RequestActionTableRow =
  Database["public"]["Tables"]["request_action_table"]["Row"];
export type RequestActionTableInsert =
  Database["public"]["Tables"]["request_action_table"]["Insert"];
export type RequestActionTableUpdate =
  Database["public"]["Tables"]["request_action_table"]["Update"];

// request_form_approver_table
export type RequestFormApproverTableRow =
  Database["public"]["Tables"]["request_form_approver_table"]["Row"];
export type RequestFormApproverTableInsert =
  Database["public"]["Tables"]["request_form_approver_table"]["Insert"];
export type RequestFormApproverTableUpdate =
  Database["public"]["Tables"]["request_form_approver_table"]["Update"];

// request_form_fact_view
export type RequestFormFactViewRow =
  Database["public"]["Views"]["request_form_fact_view"]["Row"];

// request_form_template_view
export type RequestFormTemplateViewRow =
  Database["public"]["Views"]["request_form_template_view"]["Row"];

// request_request_approver_view
export type RequestRequestApproverViewRow =
  Database["public"]["Views"]["request_request_approver_view"]["Row"];

// request_request_user_comment_view
export type RequestRequestUserCommentViewRow =
  Database["public"]["Views"]["request_request_user_comment_view"]["Row"];

// team_invitation_view
export type TeamInvitationViewRow =
  Database["public"]["Views"]["team_invitation_view"]["Row"];

// team_member_view
export type TeamMemberViewRow =
  Database["public"]["Views"]["team_member_view"]["Row"];

// team_user_notification_view
export type TeamUserNotificationViewRow =
  Database["public"]["Views"]["team_user_notification_view"]["Row"];

// Enums
// request_field_type
export type RequestFieldType =
  Database["public"]["Enums"]["request_field_type"];

// Functions

// check_if_invitation_is_valid
export type CheckIfInvitationIsValidArgs =
  Database["public"]["Functions"]["check_if_invitation_is_valid"]["Args"];
export type CheckIfInvitationIsValidReturns =
  Database["public"]["Functions"]["check_if_invitation_is_valid"]["Returns"];

// get_user_id_list_from_email_list
export type GetUserIdListFromEmailListArgs =
  Database["public"]["Functions"]["get_user_id_list_from_email_list"]["Args"];
export type GetUserIdListFromEmailListReturns =
  Database["public"]["Functions"]["get_user_id_list_from_email_list"]["Returns"];

// build_form_template
export type BuildFormTemplateArgs =
  Database["public"]["Functions"]["build_form_template"]["Args"];
export type BuildFormTemplateReturns =
  Database["public"]["Functions"]["build_form_template"]["Returns"];

// create_request
export type CreateRequestArgs =
  Database["public"]["Functions"]["create_request"]["Args"];
export type CreateRequestReturns =
  Database["public"]["Functions"]["create_request"]["Returns"];

// update_request_draft
export type UpdateRequestDraftArgs =
  Database["public"]["Functions"]["update_request_draft"]["Args"];
export type UpdateRequestDraftReturns =
  Database["public"]["Functions"]["update_request_draft"]["Returns"];

// Custom Types
export type TeamMemberRole =
  | "owner"
  | "admin"
  | "approver"
  | "member"
  | "purchaser";
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "purchased"
  | "cancelled"
  | "stale";

// Build Form Template
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

// Create Request
export type ApproverList = {
  user_id: string;
  request_status_id: RequestStatus;
}[];
// Key value pair of field_id and response
export type FieldIdResponseKeyValue = { [key: string]: string };

// Update Request Draft
// Key is response_id and value is the response_value.
export type ResponseList = { [key: string]: string };

// Notifications
export type NotificationType = "user" | "team";

// Request List to CSV
export type RequestListToCSV = {
  id: number;
  team: string;
  title: string;
  description: string;
  status: RequestStatus;
  data_created: string;
  approver: string;
  purchaser: string;
}[];
