export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      invitation_table: {
        Row: {
          invitation_date_created: string
          invitation_id: string
          invitation_target_email: string
        }
        Insert: {
          invitation_date_created?: string
          invitation_id?: string
          invitation_target_email: string
        }
        Update: {
          invitation_date_created?: string
          invitation_id?: string
          invitation_target_email?: string
        }
      }
      member_role_table: {
        Row: {
          member_role_id: string
        }
        Insert: {
          member_role_id: string
        }
        Update: {
          member_role_id?: string
        }
      }
      notification_table: {
        Row: {
          notification_content: string
          notification_date_created: string
          notification_id: string
          notification_is_read: boolean
          notification_redirect_url: string | null
        }
        Insert: {
          notification_content: string
          notification_date_created?: string
          notification_id?: string
          notification_is_read?: boolean
          notification_redirect_url?: string | null
        }
        Update: {
          notification_content?: string
          notification_date_created?: string
          notification_id?: string
          notification_is_read?: boolean
          notification_redirect_url?: string | null
        }
      }
      notification_type_table: {
        Row: {
          notification_type_id: string
        }
        Insert: {
          notification_type_id: string
        }
        Update: {
          notification_type_id?: string
        }
      }
      request_action_table: {
        Row: {
          action_id: string
          action_name: string
        }
        Insert: {
          action_id?: string
          action_name: string
        }
        Update: {
          action_id?: string
          action_name?: string
        }
      }
      request_comment_table: {
        Row: {
          comment_attachment_filepath_list: string[] | null
          comment_content: string
          comment_date_created: string
          comment_id: string
          comment_is_disabled: boolean
          comment_is_edited: boolean | null
          comment_last_updated: string | null
          comment_type_id: string
        }
        Insert: {
          comment_attachment_filepath_list?: string[] | null
          comment_content: string
          comment_date_created?: string
          comment_id?: string
          comment_is_disabled?: boolean
          comment_is_edited?: boolean | null
          comment_last_updated?: string | null
          comment_type_id: string
        }
        Update: {
          comment_attachment_filepath_list?: string[] | null
          comment_content?: string
          comment_date_created?: string
          comment_id?: string
          comment_is_disabled?: boolean
          comment_is_edited?: boolean | null
          comment_last_updated?: string | null
          comment_type_id?: string
        }
      }
      request_comment_type_table: {
        Row: {
          comment_type_id: string
        }
        Insert: {
          comment_type_id: string
        }
        Update: {
          comment_type_id?: string
        }
      }
      request_field_table: {
        Row: {
          field_id: string
          field_is_required: boolean
          field_name: string
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
        }
        Insert: {
          field_id?: string
          field_is_required?: boolean
          field_name: string
          field_option_list?: string[] | null
          field_option_tooltip_list?: string[] | null
          field_tooltip?: string | null
        }
        Update: {
          field_id?: string
          field_is_required?: boolean
          field_name?: string
          field_option_list?: string[] | null
          field_option_tooltip_list?: string[] | null
          field_tooltip?: string | null
        }
      }
      request_field_type_table: {
        Row: {
          field_type_id: string
        }
        Insert: {
          field_type_id: string
        }
        Update: {
          field_type_id?: string
        }
      }
      request_form_approver_table: {
        Row: {
          form_approver_action_id: string
          form_approver_date_created: string
          form_approver_form_id: string
          form_approver_id: string
          form_approver_is_disabled: boolean
          form_approver_is_primary_approver: boolean
          form_approver_user_id: string
        }
        Insert: {
          form_approver_action_id: string
          form_approver_date_created?: string
          form_approver_form_id: string
          form_approver_id?: string
          form_approver_is_disabled?: boolean
          form_approver_is_primary_approver?: boolean
          form_approver_user_id: string
        }
        Update: {
          form_approver_action_id?: string
          form_approver_date_created?: string
          form_approver_form_id?: string
          form_approver_id?: string
          form_approver_is_disabled?: boolean
          form_approver_is_primary_approver?: boolean
          form_approver_user_id?: string
        }
      }
      request_form_fact_table: {
        Row: {
          form_fact_field_id: string
          form_fact_field_type_id: string
          form_fact_form_id: string
          form_fact_id: string
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string
          form_fact_user_id: string
        }
        Insert: {
          form_fact_field_id: string
          form_fact_field_type_id: string
          form_fact_form_id: string
          form_fact_id?: string
          form_fact_order_number?: number | null
          form_fact_request_id?: string | null
          form_fact_request_status_id?: string | null
          form_fact_response_id?: string | null
          form_fact_team_id: string
          form_fact_user_id: string
        }
        Update: {
          form_fact_field_id?: string
          form_fact_field_type_id?: string
          form_fact_form_id?: string
          form_fact_id?: string
          form_fact_order_number?: number | null
          form_fact_request_id?: string | null
          form_fact_request_status_id?: string | null
          form_fact_response_id?: string | null
          form_fact_team_id?: string
          form_fact_user_id?: string
        }
      }
      request_form_table: {
        Row: {
          form_date_created: string
          form_id: string
          form_is_disabled: boolean
          form_is_hidden: boolean
          form_name: string
        }
        Insert: {
          form_date_created?: string
          form_id?: string
          form_is_disabled?: boolean
          form_is_hidden?: boolean
          form_name: string
        }
        Update: {
          form_date_created?: string
          form_id?: string
          form_is_disabled?: boolean
          form_is_hidden?: boolean
          form_name?: string
        }
      }
      request_request_approver_action_table: {
        Row: {
          request_approver_action_action_id: string
          request_approver_action_date_created: string
          request_approver_action_id: string
          request_approver_action_is_primary_approver: boolean
          request_approver_action_request_id: string
          request_approver_action_status_id: string
          request_approver_action_status_last_updated: string | null
          request_approver_action_status_update_comment: string | null
          request_approver_action_user_id: string
        }
        Insert: {
          request_approver_action_action_id: string
          request_approver_action_date_created?: string
          request_approver_action_id?: string
          request_approver_action_is_primary_approver?: boolean
          request_approver_action_request_id: string
          request_approver_action_status_id?: string
          request_approver_action_status_last_updated?: string | null
          request_approver_action_status_update_comment?: string | null
          request_approver_action_user_id: string
        }
        Update: {
          request_approver_action_action_id?: string
          request_approver_action_date_created?: string
          request_approver_action_id?: string
          request_approver_action_is_primary_approver?: boolean
          request_approver_action_request_id?: string
          request_approver_action_status_id?: string
          request_approver_action_status_last_updated?: string | null
          request_approver_action_status_update_comment?: string | null
          request_approver_action_user_id?: string
        }
      }
      request_request_table: {
        Row: {
          request_attachment_filepath_list: string[] | null
          request_date_created: string
          request_description: string | null
          request_id: string
          request_is_canceled: boolean
          request_is_disabled: boolean
          request_is_draft: boolean
          request_title: string
        }
        Insert: {
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string
          request_description?: string | null
          request_id?: string
          request_is_canceled?: boolean
          request_is_disabled?: boolean
          request_is_draft: boolean
          request_title: string
        }
        Update: {
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string
          request_description?: string | null
          request_id?: string
          request_is_canceled?: boolean
          request_is_disabled?: boolean
          request_is_draft?: boolean
          request_title?: string
        }
      }
      request_request_user_comment_table: {
        Row: {
          user_request_comment_comment_id: string
          user_request_comment_id: string
          user_request_comment_request_id: string
          user_request_comment_user_id: string
        }
        Insert: {
          user_request_comment_comment_id: string
          user_request_comment_id?: string
          user_request_comment_request_id: string
          user_request_comment_user_id: string
        }
        Update: {
          user_request_comment_comment_id?: string
          user_request_comment_id?: string
          user_request_comment_request_id?: string
          user_request_comment_user_id?: string
        }
      }
      request_response_table: {
        Row: {
          response_id: string
          response_value: string | null
        }
        Insert: {
          response_id?: string
          response_value?: string | null
        }
        Update: {
          response_id?: string
          response_value?: string | null
        }
      }
      request_status_table: {
        Row: {
          status_id: string
        }
        Insert: {
          status_id: string
        }
        Update: {
          status_id?: string
        }
      }
      team_invitation_table: {
        Row: {
          team_invitation_created_by: string
          team_invitation_id: string
          team_invitation_invitation_id: string
          team_invitation_team_id: string
        }
        Insert: {
          team_invitation_created_by: string
          team_invitation_id?: string
          team_invitation_invitation_id: string
          team_invitation_team_id: string
        }
        Update: {
          team_invitation_created_by?: string
          team_invitation_id?: string
          team_invitation_invitation_id?: string
          team_invitation_team_id?: string
        }
      }
      team_member_table: {
        Row: {
          team_member_date_created: string
          team_member_disabled: boolean
          team_member_id: string
          team_member_member_role_id: string
          team_member_team_id: string
          team_member_user_id: string
        }
        Insert: {
          team_member_date_created?: string
          team_member_disabled?: boolean
          team_member_id?: string
          team_member_member_role_id?: string
          team_member_team_id: string
          team_member_user_id: string
        }
        Update: {
          team_member_date_created?: string
          team_member_disabled?: boolean
          team_member_id?: string
          team_member_member_role_id?: string
          team_member_team_id?: string
          team_member_user_id?: string
        }
      }
      team_table: {
        Row: {
          team_id: string
          team_is_disabled: boolean
          team_logo_filepath: string | null
          team_name: string
          team_user_id: string
        }
        Insert: {
          team_id?: string
          team_is_disabled?: boolean
          team_logo_filepath?: string | null
          team_name: string
          team_user_id: string
        }
        Update: {
          team_id?: string
          team_is_disabled?: boolean
          team_logo_filepath?: string | null
          team_name?: string
          team_user_id?: string
        }
      }
      team_user_notification_table: {
        Row: {
          team_user_notification_id: string
          team_user_notification_notification_id: string
          team_user_notification_team_id: string | null
          team_user_notification_type_id: string
          team_user_notification_user_id: string
        }
        Insert: {
          team_user_notification_id?: string
          team_user_notification_notification_id: string
          team_user_notification_team_id?: string | null
          team_user_notification_type_id: string
          team_user_notification_user_id: string
        }
        Update: {
          team_user_notification_id?: string
          team_user_notification_notification_id?: string
          team_user_notification_team_id?: string | null
          team_user_notification_type_id?: string
          team_user_notification_user_id?: string
        }
      }
      user_profile_table: {
        Row: {
          user_avatar_filepath: string | null
          user_date_created: string
          user_email: string
          user_first_name: string
          user_id: string
          user_last_name: string
          user_signature_filepath: string | null
          username: string
        }
        Insert: {
          user_avatar_filepath?: string | null
          user_date_created?: string
          user_email: string
          user_first_name: string
          user_id: string
          user_last_name: string
          user_signature_filepath?: string | null
          username: string
        }
        Update: {
          user_avatar_filepath?: string | null
          user_date_created?: string
          user_email?: string
          user_first_name?: string
          user_id?: string
          user_last_name?: string
          user_signature_filepath?: string | null
          username?: string
        }
      }
    }
    Views: {
      request_form_approver_view: {
        Row: {
          action_id: string | null
          action_name: string | null
          form_approver_action_id: string | null
          form_approver_date_created: string | null
          form_approver_form_id: string | null
          form_approver_id: string | null
          form_approver_is_disabled: boolean | null
          form_approver_is_primary_approver: boolean | null
          form_approver_user_id: string | null
          form_date_created: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_form_fact_view: {
        Row: {
          field_id: string | null
          field_is_required: boolean | null
          field_name: string | null
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
          form_date_created: string | null
          form_fact_field_id: string | null
          form_fact_field_type_id: string | null
          form_fact_form_id: string | null
          form_fact_id: string | null
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          response_id: string | null
          response_value: string | null
          status_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_form_template_distinct_view: {
        Row: {
          field_id: string | null
          field_is_required: boolean | null
          field_name: string | null
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
          form_date_created: string | null
          form_fact_field_id: string | null
          form_fact_field_type_id: string | null
          form_fact_form_id: string | null
          form_fact_id: string | null
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          response_id: string | null
          response_value: string | null
          status_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_form_template_view: {
        Row: {
          field_id: string | null
          field_is_required: boolean | null
          field_name: string | null
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
          form_date_created: string | null
          form_fact_field_id: string | null
          form_fact_field_type_id: string | null
          form_fact_form_id: string | null
          form_fact_id: string | null
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          response_id: string | null
          response_value: string | null
          status_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_approver_action_view: {
        Row: {
          action_id: string | null
          action_name: string | null
          request_approver_action_action_id: string | null
          request_approver_action_date_created: string | null
          request_approver_action_id: string | null
          request_approver_action_is_primary_approver: boolean | null
          request_approver_action_request_id: string | null
          request_approver_action_status_id: string | null
          request_approver_action_status_last_updated: string | null
          request_approver_action_status_update_comment: string | null
          request_approver_action_user_id: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_distinct_view: {
        Row: {
          field_id: string | null
          field_is_required: boolean | null
          field_name: string | null
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
          form_date_created: string | null
          form_fact_field_id: string | null
          form_fact_field_type_id: string | null
          form_fact_form_id: string | null
          form_fact_id: string | null
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          response_id: string | null
          response_value: string | null
          status_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_user_comment_view: {
        Row: {
          comment_attachment_filepath_list: string[] | null
          comment_content: string | null
          comment_date_created: string | null
          comment_id: string | null
          comment_is_disabled: boolean | null
          comment_is_edited: boolean | null
          comment_last_updated: string | null
          comment_type_id: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_request_comment_comment_id: string | null
          user_request_comment_id: string | null
          user_request_comment_request_id: string | null
          user_request_comment_user_id: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_view: {
        Row: {
          field_id: string | null
          field_is_required: boolean | null
          field_name: string | null
          field_option_list: string[] | null
          field_option_tooltip_list: string[] | null
          field_tooltip: string | null
          form_date_created: string | null
          form_fact_field_id: string | null
          form_fact_field_type_id: string | null
          form_fact_form_id: string | null
          form_fact_id: string | null
          form_fact_order_number: number | null
          form_fact_request_id: string | null
          form_fact_request_status_id: string | null
          form_fact_response_id: string | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: string | null
          form_is_disabled: boolean | null
          form_is_hidden: boolean | null
          form_name: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: string | null
          request_is_canceled: boolean | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_title: string | null
          response_id: string | null
          response_value: string | null
          status_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      team_invitation_view: {
        Row: {
          invitation_date_created: string | null
          invitation_id: string | null
          invitation_target_email: string | null
          team_id: string | null
          team_invitation_created_by: string | null
          team_invitation_id: string | null
          team_invitation_invitation_id: string | null
          team_invitation_team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      team_member_view: {
        Row: {
          member_role_id: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_member_date_created: string | null
          team_member_disabled: boolean | null
          team_member_id: string | null
          team_member_member_role_id: string | null
          team_member_team_id: string | null
          team_member_user_id: string | null
          team_name: string | null
          team_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      team_user_notification_view: {
        Row: {
          notification_content: string | null
          notification_date_created: string | null
          notification_id: string | null
          notification_is_read: boolean | null
          notification_redirect_url: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_id: string | null
          team_user_notification_id: string | null
          team_user_notification_notification_id: string | null
          team_user_notification_team_id: string | null
          team_user_notification_type_id: string | null
          team_user_notification_user_id: string | null
          user_avatar_filepath: string | null
          user_date_created: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
    }
    Functions: {
      check_email_exists: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
      get_current_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
