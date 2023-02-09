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

// Functions

// Custom Types
export type TeamMemberRole = "owner" | "admin" | "member";
export type RequestStatus = "pending" | "approved" | "rejected";
export const requestStatusList = ["pending", "approved", "rejected"];

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

export type RequestFieldType =
  | "section"
  | "repeatable_section"
  | "text"
  | "number"
  | "date"
  | "daterange"
  | "select"
  // | "slider"
  | "multiple";
export const requestFieldTypeList = [
  "section",
  "repeatable_section",
  "text",
  "number",
  "date",
  "daterange",
  "select",
  // "slider",
  "multiple",
];

export type Bucket =
  | "request_attachments"
  | "comment_attachments"
  | "avatars"
  | "signatures"
  | "team_logos";

export type CommentType =
  | "comment"
  | "approved"
  | "rejected"
  | "canceled"
  | "undo"
  | "uncanceled"
  | "request_created";
