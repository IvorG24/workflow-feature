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
          invitation_id: number
          invitation_target_email: string | null
          invitation_date_created: string | null
        }
        Insert: {
          invitation_id?: never
          invitation_target_email?: string | null
          invitation_date_created?: string | null
        }
        Update: {
          invitation_id?: never
          invitation_target_email?: string | null
          invitation_date_created?: string | null
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
          notification_id: number
          notification_content: string | null
          notification_redirect_url: string | null
          notification_date_created: string | null
          notification_is_read: boolean | null
        }
        Insert: {
          notification_id?: never
          notification_content?: string | null
          notification_redirect_url?: string | null
          notification_date_created?: string | null
          notification_is_read?: boolean | null
        }
        Update: {
          notification_id?: never
          notification_content?: string | null
          notification_redirect_url?: string | null
          notification_date_created?: string | null
          notification_is_read?: boolean | null
        }
      }
      request_comment_table: {
        Row: {
          comment_id: number
          comment_content: string | null
          comment_last_updated: string | null
          comment_date_created: string | null
          comment_is_edited: boolean | null
          comment_is_disabled: boolean | null
        }
        Insert: {
          comment_id?: never
          comment_content?: string | null
          comment_last_updated?: string | null
          comment_date_created?: string | null
          comment_is_edited?: boolean | null
          comment_is_disabled?: boolean | null
        }
        Update: {
          comment_id?: never
          comment_content?: string | null
          comment_last_updated?: string | null
          comment_date_created?: string | null
          comment_is_edited?: boolean | null
          comment_is_disabled?: boolean | null
        }
      }
      request_field_table: {
        Row: {
          field_id: number
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
        }
        Insert: {
          field_id?: never
          field_name?: string | null
          request_field_type?:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options?: string[] | null
          field_tooltip?: string | null
          field_is_required?: boolean | null
        }
        Update: {
          field_id?: never
          field_name?: string | null
          request_field_type?:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options?: string[] | null
          field_tooltip?: string | null
          field_is_required?: boolean | null
        }
      }
      request_form_fact_table: {
        Row: {
          form_fact_id: number
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
        }
        Insert: {
          form_fact_id?: never
          form_fact_user_id?: string | null
          form_fact_team_id?: string | null
          form_fact_field_id?: number | null
          form_fact_response_id?: number | null
          form_fact_order_id?: number | null
          form_fact_request_id?: number | null
          form_fact_form_id?: number | null
          form_fact_request_status_id?: string | null
        }
        Update: {
          form_fact_id?: never
          form_fact_user_id?: string | null
          form_fact_team_id?: string | null
          form_fact_field_id?: number | null
          form_fact_response_id?: number | null
          form_fact_order_id?: number | null
          form_fact_request_id?: number | null
          form_fact_form_id?: number | null
          form_fact_request_status_id?: string | null
        }
      }
      request_form_table: {
        Row: {
          form_id: number
          form_name: string | null
          form_created_at: string | null
        }
        Insert: {
          form_id?: never
          form_name?: string | null
          form_created_at?: string | null
        }
        Update: {
          form_id?: never
          form_name?: string | null
          form_created_at?: string | null
        }
      }
      request_order_table: {
        Row: {
          order_id: number
          order_field_id_list: number[] | null
          order_last_updated: string | null
        }
        Insert: {
          order_id?: never
          order_field_id_list?: number[] | null
          order_last_updated?: string | null
        }
        Update: {
          order_id?: never
          order_field_id_list?: number[] | null
          order_last_updated?: string | null
        }
      }
      request_request_approver_table: {
        Row: {
          request_approver_id: number
          request_approver_request_id: number | null
          request_approver_user_id: string | null
          request_approver_status_last_updated: string | null
          request_approver_request_status_id: string | null
        }
        Insert: {
          request_approver_id?: never
          request_approver_request_id?: number | null
          request_approver_user_id?: string | null
          request_approver_status_last_updated?: string | null
          request_approver_request_status_id?: string | null
        }
        Update: {
          request_approver_id?: never
          request_approver_request_id?: number | null
          request_approver_user_id?: string | null
          request_approver_status_last_updated?: string | null
          request_approver_request_status_id?: string | null
        }
      }
      request_request_table: {
        Row: {
          request_id: number
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_attachment_filepath_list: string[] | null
          request_date_created: string | null
          request_is_draft: boolean | null
          request_is_disabled: boolean | null
        }
        Insert: {
          request_id?: never
          request_title?: string | null
          request_description?: string | null
          request_on_behalf_of?: string | null
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string | null
          request_is_draft?: boolean | null
          request_is_disabled?: boolean | null
        }
        Update: {
          request_id?: never
          request_title?: string | null
          request_description?: string | null
          request_on_behalf_of?: string | null
          request_attachment_filepath_list?: string[] | null
          request_date_created?: string | null
          request_is_draft?: boolean | null
          request_is_disabled?: boolean | null
        }
      }
      request_request_user_comment_table: {
        Row: {
          user_request_comment_id: number
          user_request_comment_user_id: string | null
          user_request_comment_request_id: number | null
          user_request_comment_comment_id: number | null
        }
        Insert: {
          user_request_comment_id?: never
          user_request_comment_user_id?: string | null
          user_request_comment_request_id?: number | null
          user_request_comment_comment_id?: number | null
        }
        Update: {
          user_request_comment_id?: never
          user_request_comment_user_id?: string | null
          user_request_comment_request_id?: number | null
          user_request_comment_comment_id?: number | null
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
          team_invitation_id: number
          team_invitation_created_by: string | null
          team_invitation_team_id: string | null
          team_invitation_invitation_id: number | null
        }
        Insert: {
          team_invitation_id?: never
          team_invitation_created_by?: string | null
          team_invitation_team_id?: string | null
          team_invitation_invitation_id?: number | null
        }
        Update: {
          team_invitation_id?: never
          team_invitation_created_by?: string | null
          team_invitation_team_id?: string | null
          team_invitation_invitation_id?: number | null
        }
      }
      team_member_table: {
        Row: {
          team_member_id: number
          team_member_user_id: string | null
          team_member_team_id: string | null
          team_member_member_role_id: string | null
          team_member_date_created: string | null
          team_member_lock_account: boolean | null
        }
        Insert: {
          team_member_id?: never
          team_member_user_id?: string | null
          team_member_team_id?: string | null
          team_member_member_role_id?: string | null
          team_member_date_created?: string | null
          team_member_lock_account?: boolean | null
        }
        Update: {
          team_member_id?: never
          team_member_user_id?: string | null
          team_member_team_id?: string | null
          team_member_member_role_id?: string | null
          team_member_date_created?: string | null
          team_member_lock_account?: boolean | null
        }
      }
      team_table: {
        Row: {
          team_name: string | null
          team_logo_filepath: string | null
          team_id: string
        }
        Insert: {
          team_name?: string | null
          team_logo_filepath?: string | null
          team_id?: string
        }
        Update: {
          team_name?: string | null
          team_logo_filepath?: string | null
          team_id?: string
        }
      }
      team_user_notification_table: {
        Row: {
          team_user_notification_id: number
          team_user_notification_team_id: string | null
          team_user_notification_user_id: string | null
          team_user_notification_notification_id: number | null
        }
        Insert: {
          team_user_notification_id?: never
          team_user_notification_team_id?: string | null
          team_user_notification_user_id?: string | null
          team_user_notification_notification_id?: number | null
        }
        Update: {
          team_user_notification_id?: never
          team_user_notification_team_id?: string | null
          team_user_notification_user_id?: string | null
          team_user_notification_notification_id?: number | null
        }
      }
      user_profile_table: {
        Row: {
          user_id: string
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          user_created_at: string | null
        }
        Insert: {
          user_id: string
          username?: string | null
          user_first_name?: string | null
          user_last_name?: string | null
          user_avatar_filepath?: string | null
          user_email?: string | null
          user_created_at?: string | null
        }
        Update: {
          user_id?: string
          username?: string | null
          user_first_name?: string | null
          user_last_name?: string | null
          user_avatar_filepath?: string | null
          user_email?: string | null
          user_created_at?: string | null
        }
      }
    }
    Views: {
      request_form_fact_view: {
        Row: {
          form_fact_id: number | null
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          order_id: number | null
          order_field_id_list: number[] | null
          order_last_updated: string | null
          form_id: number | null
          form_name: string | null
          form_created_at: string | null
          field_id: number | null
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
          response_id: number | null
          response_value: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      request_form_template_distinct_view: {
        Row: {
          form_fact_id: number | null
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          order_id: number | null
          order_field_id_list: number[] | null
          order_last_updated: string | null
          form_id: number | null
          form_name: string | null
          form_created_at: string | null
          field_id: number | null
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
          response_id: number | null
          response_value: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      request_form_template_view: {
        Row: {
          form_fact_id: number | null
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          order_id: number | null
          order_field_id_list: number[] | null
          order_last_updated: string | null
          form_id: number | null
          form_name: string | null
          form_created_at: string | null
          field_id: number | null
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
          response_id: number | null
          response_value: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      request_request_approver_status_view: {
        Row: {
          request_id: number | null
          approvers: Json | null
        }
      }
      request_request_approver_view: {
        Row: {
          request_approver_id: number | null
          request_approver_request_id: number | null
          request_approver_user_id: string | null
          request_approver_request_status_id: string | null
          request_approver_status_last_updated: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      request_request_distinct_view: {
        Row: {
          form_fact_id: number | null
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          order_id: number | null
          order_field_id_list: number[] | null
          order_last_updated: string | null
          form_id: number | null
          form_name: string | null
          form_created_at: string | null
          field_id: number | null
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
          response_id: number | null
          response_value: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      request_request_user_comment_view: {
        Row: {
          user_request_comment_id: number | null
          user_request_comment_user_id: string | null
          user_request_comment_request_id: number | null
          user_request_comment_comment_id: number | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          comment_id: number | null
          comment_date_created: string | null
          comment_content: string | null
          comment_is_edited: boolean | null
          comment_last_updated: string | null
          comment_is_disabled: boolean | null
        }
      }
      request_request_view: {
        Row: {
          form_fact_id: number | null
          form_fact_user_id: string | null
          form_fact_team_id: string | null
          form_fact_field_id: number | null
          form_fact_response_id: number | null
          form_fact_order_id: number | null
          form_fact_request_id: number | null
          form_fact_form_id: number | null
          form_fact_request_status_id: string | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          order_id: number | null
          order_field_id_list: number[] | null
          order_last_updated: string | null
          form_id: number | null
          form_name: string | null
          form_created_at: string | null
          field_id: number | null
          field_name: string | null
          request_field_type:
            | Database["public"]["Enums"]["request_field_type"]
            | null
          field_options: string[] | null
          field_tooltip: string | null
          field_is_required: boolean | null
          response_id: number | null
          response_value: string | null
          request_id: number | null
          request_date_created: string | null
          request_title: string | null
          request_description: string | null
          request_on_behalf_of: string | null
          request_is_draft: boolean | null
          request_attachment_filepath_list: string[] | null
          request_is_disabled: boolean | null
          request_status_id: string | null
        }
      }
      team_invitation_view: {
        Row: {
          team_invitation_id: number | null
          team_invitation_created_by: string | null
          team_invitation_team_id: string | null
          team_invitation_invitation_id: number | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          invitation_id: number | null
          invitation_date_created: string | null
          invitation_target_email: string | null
        }
      }
      team_member_view: {
        Row: {
          team_member_id: number | null
          team_member_user_id: string | null
          team_member_team_id: string | null
          team_member_member_role_id: string | null
          team_member_date_created: string | null
          team_member_lock_account: boolean | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
          member_role_id: string | null
        }
      }
      team_user_notification_view: {
        Row: {
          team_user_notification_id: number | null
          team_user_notification_team_id: string | null
          team_user_notification_user_id: string | null
          team_user_notification_notification_id: number | null
          user_id: string | null
          user_created_at: string | null
          username: string | null
          user_first_name: string | null
          user_last_name: string | null
          user_avatar_filepath: string | null
          user_email: string | null
          notification_id: number | null
          notification_date_created: string | null
          notification_content: string | null
          notification_is_read: boolean | null
          notification_redirect_url: string | null
          team_id: string | null
          team_name: string | null
          team_logo_filepath: string | null
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
        Args: { request_id: number; response_list: Json }
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
