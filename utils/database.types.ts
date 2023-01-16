export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      field_table: {
        Row: {
          field_id: number;
          field_name: string | null;
          field_type: Database["public"]["Enums"]["field_type"] | null;
          field_option: string[] | null;
          is_required: boolean | null;
          field_tooltip: string | null;
          form_table_id: number | null;
        };
        Insert: {
          field_id?: never;
          field_name?: string | null;
          field_type?: Database["public"]["Enums"]["field_type"] | null;
          field_option?: string[] | null;
          is_required?: boolean | null;
          field_tooltip?: string | null;
          form_table_id?: number | null;
        };
        Update: {
          field_id?: never;
          field_name?: string | null;
          field_type?: Database["public"]["Enums"]["field_type"] | null;
          field_option?: string[] | null;
          is_required?: boolean | null;
          field_tooltip?: string | null;
          form_table_id?: number | null;
        };
      };
      form_table: {
        Row: {
          form_id: number;
          form_name: string | null;
          form_owner: string | null;
          team_id: string | null;
          form_type: Database["public"]["Enums"]["form_type"] | null;
          form_priority: number[] | null;
          form_created_at: string | null;
          form_status: Database["public"]["Enums"]["form_status"] | null;
        };
        Insert: {
          form_id?: never;
          form_name?: string | null;
          form_owner?: string | null;
          team_id?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          form_priority?: number[] | null;
          form_created_at?: string | null;
          form_status?: Database["public"]["Enums"]["form_status"] | null;
        };
        Update: {
          form_id?: never;
          form_name?: string | null;
          form_owner?: string | null;
          team_id?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          form_priority?: number[] | null;
          form_created_at?: string | null;
          form_status?: Database["public"]["Enums"]["form_status"] | null;
        };
      };
      request_comment_table: {
        Row: {
          request_comment_id: number;
          request_comment: string | null;
          request_comment_created_at: string | null;
          request_comment_is_edited: boolean | null;
          request_id: number | null;
          request_comment_by_id: string | null;
        };
        Insert: {
          request_comment_id?: never;
          request_comment?: string | null;
          request_comment_created_at?: string | null;
          request_comment_is_edited?: boolean | null;
          request_id?: number | null;
          request_comment_by_id?: string | null;
        };
        Update: {
          request_comment_id?: never;
          request_comment?: string | null;
          request_comment_created_at?: string | null;
          request_comment_is_edited?: boolean | null;
          request_id?: number | null;
          request_comment_by_id?: string | null;
        };
      };
      request_response_table: {
        Row: {
          field_id: number;
          response_value: string | null;
          request_id: number;
        };
        Insert: {
          field_id: number;
          response_value?: string | null;
          request_id: number;
        };
        Update: {
          field_id?: number;
          response_value?: string | null;
          request_id?: number;
        };
      };
      request_table: {
        Row: {
          request_id: number;
          approver_id: string | null;
          purchaser_id: string | null;
          requested_by: string | null;
          request_created_at: string | null;
          request_status_updated_at: string | null;
          request_status: Database["public"]["Enums"]["request_status"] | null;
          request_is_purchased: boolean | null;
          form_table_id: number | null;
          request_title: string | null;
          on_behalf_of: string | null;
          request_description: string | null;
          is_draft: boolean | null;
          attachments: string[] | null;
          request_is_disabled: boolean | null;
        };
        Insert: {
          request_id?: never;
          approver_id?: string | null;
          purchaser_id?: string | null;
          requested_by?: string | null;
          request_created_at?: string | null;
          request_status_updated_at?: string | null;
          request_status?: Database["public"]["Enums"]["request_status"] | null;
          request_is_purchased?: boolean | null;
          form_table_id?: number | null;
          request_title?: string | null;
          on_behalf_of?: string | null;
          request_description?: string | null;
          is_draft?: boolean | null;
          attachments?: string[] | null;
          request_is_disabled?: boolean | null;
        };
        Update: {
          request_id?: never;
          approver_id?: string | null;
          purchaser_id?: string | null;
          requested_by?: string | null;
          request_created_at?: string | null;
          request_status_updated_at?: string | null;
          request_status?: Database["public"]["Enums"]["request_status"] | null;
          request_is_purchased?: boolean | null;
          form_table_id?: number | null;
          request_title?: string | null;
          on_behalf_of?: string | null;
          request_description?: string | null;
          is_draft?: boolean | null;
          attachments?: string[] | null;
          request_is_disabled?: boolean | null;
        };
      };
      review_response_table: {
        Row: {
          field_id: number;
          response_value: string | null;
          review_id: number;
        };
        Insert: {
          field_id: number;
          response_value?: string | null;
          review_id: number;
        };
        Update: {
          field_id?: number;
          response_value?: string | null;
          review_id?: number;
        };
      };
      review_table: {
        Row: {
          review_id: number;
          form_table_id: number | null;
          review_source: string | null;
          review_target: string | null;
          review_created_at: string | null;
          is_draft: boolean | null;
        };
        Insert: {
          review_id?: never;
          form_table_id?: number | null;
          review_source?: string | null;
          review_target?: string | null;
          review_created_at?: string | null;
          is_draft?: boolean | null;
        };
        Update: {
          review_id?: never;
          form_table_id?: number | null;
          review_source?: string | null;
          review_target?: string | null;
          review_created_at?: string | null;
          is_draft?: boolean | null;
        };
      };
      team_invitation_table: {
        Row: {
          team_invitation_id: number;
          team_id: string | null;
          invite_source: string | null;
          invite_target: string | null;
          created_at: string | null;
        };
        Insert: {
          team_invitation_id?: never;
          team_id?: string | null;
          invite_source?: string | null;
          invite_target?: string | null;
          created_at?: string | null;
        };
        Update: {
          team_invitation_id?: never;
          team_id?: string | null;
          invite_source?: string | null;
          invite_target?: string | null;
          created_at?: string | null;
        };
      };
      team_role_table: {
        Row: {
          user_id: string;
          team_id: string;
          team_role: Database["public"]["Enums"]["team_role"] | null;
          lock_account: boolean | null;
        };
        Insert: {
          user_id: string;
          team_id: string;
          team_role?: Database["public"]["Enums"]["team_role"] | null;
          lock_account?: boolean | null;
        };
        Update: {
          user_id?: string;
          team_id?: string;
          team_role?: Database["public"]["Enums"]["team_role"] | null;
          lock_account?: boolean | null;
        };
      };
      team_table: {
        Row: {
          team_id: string;
          team_logo_filepath: string | null;
          team_name: string | null;
          team_is_disabled: boolean;
        };
        Insert: {
          team_id?: string;
          team_logo_filepath?: string | null;
          team_name?: string | null;
          team_is_disabled?: boolean | null;
        };
        Update: {
          team_id?: string;
          team_logo_filepath?: string | null;
          team_name?: string | null;
          team_is_disabled?: boolean | null;
        };
      };
      user_notification_table: {
        Row: {
          notification_id: number;
          user_id: string | null;
          team_id: string | null;
          form_type: Database["public"]["Enums"]["form_type"] | null;
          notification_message: string | null;
          redirection_url: string | null;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          notification_id?: never;
          user_id?: string | null;
          team_id?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          notification_message?: string | null;
          redirection_url?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          notification_id?: never;
          user_id?: string | null;
          team_id?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          notification_message?: string | null;
          redirection_url?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };
      user_profile_table: {
        Row: {
          user_id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
        };
        Insert: {
          user_id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
        };
        Update: {
          user_id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_if_invitation_is_valid: {
        Args: { invitation_id: number };
        Returns: boolean;
      };
      get_user_id_list_from_email_list: {
        Args: { email_list: string[] };
        Returns: string[];
      };
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      field_type:
        | "text"
        | "number"
        | "date"
        | "daterange"
        | "time"
        | "email"
        | "select"
        | "slider"
        | "multiple"
        | "section";
      form_status: "active" | "inactive";
      form_type: "request" | "review";
      request_status:
        | "approved"
        | "rejected"
        | "pending"
        | "revision"
        | "stale";
      team_role: "owner" | "admin" | "purchaser" | "member";
    };
  };
};
