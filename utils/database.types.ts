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
          invitation_date_created: string | null
          invitation_id: number
          invitation_target_email: string | null
        }
        Insert: {
          invitation_date_created?: string | null
          invitation_id?: never
          invitation_target_email?: string | null
        }
        Update: {
          invitation_date_created?: string | null
          invitation_id?: never
          invitation_target_email?: string | null
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
          notification_content: string | null
          notification_date_created: string | null
          notification_id: number
          notification_is_read: boolean | null
          notification_redirect_url: string | null
        }
        Insert: {
          notification_content?: string | null
          notification_date_created?: string | null
          notification_id?: never
          notification_is_read?: boolean | null
          notification_redirect_url?: string | null
        }
        Update: {
          notification_content?: string | null
          notification_date_created?: string | null
          notification_id?: never
          notification_is_read?: boolean | null
          notification_redirect_url?: string | null
        }
      }
      request_action_table: {
        Row: {
          action_id: string
        }
        Insert: {
          action_id: string
        }
        Update: {
          action_id?: string
        }
      }
      request_comment_table: {
        Row: {
          comment_attachment_filepath: string | null
          comment_content: string | null
          comment_date_created: string | null
          comment_id: number
          comment_is_disabled: boolean | null
          comment_is_edited: boolean | null
          comment_last_updated: string | null
        }
        Insert: {
          comment_attachment_filepath?: string | null
          comment_content?: string | null
          comment_date_created?: string | null
          comment_id?: never
          comment_is_disabled?: boolean | null
          comment_is_edited?: boolean | null
          comment_last_updated?: string | null
        }
        Update: {
          comment_attachment_filepath?: string | null
          comment_content?: string | null
          comment_date_created?: string | null
          comment_id?: never
          comment_is_disabled?: boolean | null
          comment_is_edited?: boolean | null
          comment_last_updated?: string | null
        }
      }
      request_field_table: {
        Row: {
          field_id: number
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
        }
        Insert: {
          field_id?: never
          field_is_required?: boolean | null
          field_name?: string | null
          field_options?: string[] | null
          field_tooltip?: string | null
          request_field_type?:
            | Database["public"]["Enums"]["request_field_type"]
            | null
        }
        Update: {
          field_id?: never
          field_is_required?: boolean | null
          field_name?: string | null
          field_options?: string[] | null
          field_tooltip?: string | null
          request_field_type?:
            | Database["public"]["Enums"]["request_field_type"]
            | null
        }
      }
      request_form_approver_table: {
        Row: {
          form_approver_action_id: string | null
          form_approver_form_id: number | null
          form_approver_id: number
          form_approver_user_id: string | null
        }
        Insert: {
          form_approver_action_id?: string | null
          form_approver_form_id?: number | null
          form_approver_id?: never
          form_approver_user_id?: string | null
        }
        Update: {
          form_approver_action_id?: string | null
          form_approver_form_id?: number | null
          form_approver_id?: never
          form_approver_user_id?: string | null
        }
      }
      request_form_fact_table: {
        Row: {
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
        }
        Insert: {
          form_fact_field_id?: number | null
          form_fact_form_id?: number | null
          form_fact_id?: never
          form_fact_order_id?: number | null
          form_fact_request_id?: number | null
          form_fact_request_status_id?: string | null
          form_fact_response_id?: number | null
          form_fact_team_id?: string | null
          form_fact_user_id?: string | null
        }
        Update: {
          form_fact_field_id?: number | null
          form_fact_form_id?: number | null
          form_fact_id?: never
          form_fact_order_id?: number | null
          form_fact_request_id?: number | null
          form_fact_request_status_id?: string | null
          form_fact_response_id?: number | null
          form_fact_team_id?: string | null
          form_fact_user_id?: string | null
        }
      }
      request_form_table: {
        Row: {
          form_created_at: string | null
          form_id: number
          form_name: string | null
        }
        Insert: {
          form_created_at?: string | null
          form_id?: never
          form_name?: string | null
        }
        Update: {
          form_created_at?: string | null
          form_id?: never
          form_name?: string | null
        }
      }
      request_order_table: {
        Row: {
          order_field_id_list: number[] | null
          order_id: number
          order_last_updated: string | null
        }
        Insert: {
          order_field_id_list?: number[] | null
          order_id?: never
          order_last_updated?: string | null
        }
        Update: {
          order_field_id_list?: number[] | null
          order_id?: never
          order_last_updated?: string | null
        }
      }
      request_request_approver_action_table: {
        Row: {
          request_approver_action_action_id: string | null
          request_approver_action_id: number
          request_approver_action_is_approved: boolean | null
          request_approver_action_request_id: number | null
          request_approver_action_status_last_updated: string | null
          request_approver_action_user_id: string | null
        }
        Insert: {
          request_approver_action_action_id?: string | null
          request_approver_action_id?: never
          request_approver_action_is_approved?: boolean | null
          request_approver_action_request_id?: number | null
          request_approver_action_status_last_updated?: string | null
          request_approver_action_user_id?: string | null
        }
        Update: {
          request_approver_action_action_id?: string | null
          request_approver_action_id?: never
          request_approver_action_is_approved?: boolean | null
          request_approver_action_request_id?: number | null
          request_approver_action_status_last_updated?: string | null
          request_approver_action_user_id?: string | null
        }
      }
      request_request_approver_table: {
        Row: {
          request_approver_id: number
          request_approver_request_id: number | null
          request_approver_request_status_id: string | null
          request_approver_status_last_updated: string | null
          request_approver_user_id: string | null
        }
        Insert: {
          request_approver_id?: never
          request_approver_request_id?: number | null
          request_approver_request_status_id?: string | null
          request_approver_status_last_updated?: string | null
          request_approver_user_id?: string | null
        }
        Update: {
          request_approver_id?: never
          request_approver_request_id?: number | null
          request_approver_request_status_id?: string | null
          request_approver_status_last_updated?: string | null
          request_approver_user_id?: string | null
        }
      }
      request_request_table: {
        Row: {
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: number
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_title: string | null
        }
        Insert: {
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string | null
          request_description?: string | null
          request_id?: number
          request_is_disabled?: boolean | null
          request_is_draft?: boolean | null
          request_on_behalf_of?: string | null
          request_title?: string | null
        }
        Update: {
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string | null
          request_description?: string | null
          request_id?: number
          request_is_disabled?: boolean | null
          request_is_draft?: boolean | null
          request_on_behalf_of?: string | null
          request_title?: string | null
        }
      }
      request_request_user_comment_table: {
        Row: {
          user_request_comment_comment_id: number | null
          user_request_comment_id: number
          user_request_comment_request_id: number | null
          user_request_comment_user_id: string | null
        }
        Insert: {
          user_request_comment_comment_id?: number | null
          user_request_comment_id?: never
          user_request_comment_request_id?: number | null
          user_request_comment_user_id?: string | null
        }
        Update: {
          user_request_comment_comment_id?: number | null
          user_request_comment_id?: never
          user_request_comment_request_id?: number | null
          user_request_comment_user_id?: string | null
        }
      }
      request_response_table: {
        Row: {
          response_id: number
          response_value: string | null
        }
        Insert: {
          response_id?: never
          response_value?: string | null
        }
        Update: {
          response_id?: never
          response_value?: string | null
        }
      }
      request_status_table: {
        Row: {
          request_status_id: string
        }
        Insert: {
          request_status_id: string
        }
        Update: {
          request_status_id?: string
        }
      }
      team_invitation_table: {
        Row: {
          team_invitation_created_by: string | null
          team_invitation_id: number
          team_invitation_invitation_id: number | null
          team_invitation_team_id: string | null
        }
        Insert: {
          team_invitation_created_by?: string | null
          team_invitation_id?: never
          team_invitation_invitation_id?: number | null
          team_invitation_team_id?: string | null
        }
        Update: {
          team_invitation_created_by?: string | null
          team_invitation_id?: never
          team_invitation_invitation_id?: number | null
          team_invitation_team_id?: string | null
        }
      }
      team_member_table: {
        Row: {
          team_member_date_created: string | null
          team_member_id: number
          team_member_lock_account: boolean | null
          team_member_member_role_id: string | null
          team_member_team_id: string | null
          team_member_user_id: string | null
        }
        Insert: {
          team_member_date_created?: string | null
          team_member_id?: never
          team_member_lock_account?: boolean | null
          team_member_member_role_id?: string | null
          team_member_team_id?: string | null
          team_member_user_id?: string | null
        }
        Update: {
          team_member_date_created?: string | null
          team_member_id?: never
          team_member_lock_account?: boolean | null
          team_member_member_role_id?: string | null
          team_member_team_id?: string | null
          team_member_user_id?: string | null
        }
      }
      team_table: {
        Row: {
          team_id: string
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
        }
        Insert: {
          team_id?: string
          team_is_disabled?: boolean | null
          team_logo_filepath?: string | null
          team_name?: string | null
        }
        Update: {
          team_id?: string
          team_is_disabled?: boolean | null
          team_logo_filepath?: string | null
          team_name?: string | null
        }
      }
      team_user_notification_table: {
        Row: {
          team_user_notification_id: number
          team_user_notification_notification_id: number | null
          team_user_notification_team_id: string | null
          team_user_notification_user_id: string | null
        }
        Insert: {
          team_user_notification_id?: never
          team_user_notification_notification_id?: number | null
          team_user_notification_team_id?: string | null
          team_user_notification_user_id?: string | null
        }
        Update: {
          team_user_notification_id?: never
          team_user_notification_notification_id?: number | null
          team_user_notification_team_id?: string | null
          team_user_notification_user_id?: string | null
        }
      }
      user_profile_table: {
        Row: {
          user_avatar_filepath: string | null
          user_created_at: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
        Insert: {
          user_avatar_filepath?: string | null
          user_created_at?: string | null
          user_email?: string | null
          user_first_name?: string | null
          user_id: string
          user_last_name?: string | null
          user_signature_filepath?: string | null
          username?: string | null
        }
        Update: {
          user_avatar_filepath?: string | null
          user_created_at?: string | null
          user_email?: string | null
          user_first_name?: string | null
          user_id?: string
          user_last_name?: string | null
          user_signature_filepath?: string | null
          username?: string | null
        }
      }
    }
    Views: {
      request_form_approver_action_view: {
        Row: {
          approvers: Json | null
          form_id: number | null
        }
      }
      request_form_approver_view: {
        Row: {
          action_id: string | null
          form_approver_action_id: string | null
          form_approver_form_id: number | null
          form_approver_id: number | null
          form_approver_user_id: string | null
          form_created_at: string | null
          form_id: number | null
          form_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_approver_status_view: {
        Row: {
          approvers: Json | null
          request_id: number | null
        }
      }
      request_request_approver_view: {
        Row: {
          request_approver_id: number | null
          request_approver_request_id: number | null
          request_approver_request_status_id: string | null
          request_approver_status_last_updated: string | null
          request_approver_user_id: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_draft_distinct_view: {
        Row: {
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_draft_view: {
        Row: {
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          comment_attachment_filepath: string | null
          comment_content: string | null
          comment_date_created: string | null
          comment_id: number | null
          comment_is_disabled: boolean | null
          comment_is_edited: boolean | null
          comment_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_title: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_request_comment_comment_id: number | null
          user_request_comment_id: number | null
          user_request_comment_request_id: number | null
          user_request_comment_user_id: string | null
          user_signature_filepath: string | null
          username: string | null
        }
      }
      request_request_view: {
        Row: {
          field_id: number | null
          field_is_required: boolean | null
          field_name: string | null
          field_options: string[] | null
          field_tooltip: string | null
          form_created_at: string | null
          form_fact_field_id: number | null
          form_fact_form_id: number | null
          form_fact_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_request_status_id: string | null
          form_fact_response_id: number | null
          form_fact_team_id: string | null
          form_fact_user_id: string | null
          form_id: number | null
          form_name: string | null
          order_field_id_list: number[] | null
          order_id: number | null
          order_last_updated: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_description: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          request_id: number | null
          request_is_disabled: boolean | null
          request_is_draft: boolean | null
          request_on_behalf_of: string | null
          request_status_id: string | null
          request_title: string | null
          response_id: number | null
          response_value: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          invitation_id: number | null
          invitation_target_email: string | null
          team_id: string | null
          team_invitation_created_by: string | null
          team_invitation_id: number | null
          team_invitation_invitation_id: number | null
          team_invitation_team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          team_member_id: number | null
          team_member_lock_account: boolean | null
          team_member_member_role_id: string | null
          team_member_team_id: string | null
          team_member_user_id: string | null
          team_name: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
          notification_id: number | null
          notification_is_read: boolean | null
          notification_redirect_url: string | null
          team_id: string | null
          team_is_disabled: boolean | null
          team_logo_filepath: string | null
          team_name: string | null
          team_user_notification_id: number | null
          team_user_notification_notification_id: number | null
          team_user_notification_team_id: string | null
          team_user_notification_user_id: string | null
          user_avatar_filepath: string | null
          user_created_at: string | null
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
      build_form_template: {
        Args: {
          react_dnd_form_template: Json
          user_id: string
          team_id: string
        }
        Returns: number
      }
      change_user_password: {
        Args: { current_plain_password: string; new_plain_password: string }
        Returns: Json
      }
      check_if_invitation_is_valid: {
        Args: { invitation_id_var: number }
        Returns: boolean
      }
      create_request: {
        Args: {
          form_id: number
          user_id: string
          team_id: string
          request: Json
          approver_list: Json
          response_list: Json
        }
        Returns: number
      }
      get_current_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_id_list_from_email_list: {
        Args: { email_list: string[] }
        Returns: string[]
      }
      update_request_draft: {
        Args: { request_input: Json; response_list: Json; approver_list: Json }
        Returns: string
      }
    }
    Enums: {
      request_field_type:
        | "text"
        | "number"
        | "date"
        | "daterange"
        | "time"
        | "email"
        | "select"
        | "slider"
        | "multiple"
        | "section"
    }
  }
}
