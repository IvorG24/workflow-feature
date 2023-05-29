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
      attachment_table: {
        Row: {
          attachment_bucket: string;
          attachment_date_created: string;
          attachment_id: string;
          attachment_is_disabled: boolean;
          attachment_name: string;
          attachment_value: string;
        };
        Insert: {
          attachment_bucket: string;
          attachment_date_created?: string;
          attachment_id?: string;
          attachment_is_disabled?: boolean;
          attachment_name: string;
          attachment_value: string;
        };
        Update: {
          attachment_bucket?: string;
          attachment_date_created?: string;
          attachment_id?: string;
          attachment_is_disabled?: boolean;
          attachment_name?: string;
          attachment_value?: string;
        };
      };
      comment_table: {
        Row: {
          comment_content: string | null;
          comment_date_created: string;
          comment_id: string;
          comment_is_disabled: boolean;
          comment_is_edited: boolean | null;
          comment_last_updated: string | null;
          comment_request_id: string;
          comment_team_member_id: string;
          comment_type: string;
        };
        Insert: {
          comment_content?: string | null;
          comment_date_created?: string;
          comment_id?: string;
          comment_is_disabled?: boolean;
          comment_is_edited?: boolean | null;
          comment_last_updated?: string | null;
          comment_request_id: string;
          comment_team_member_id: string;
          comment_type: string;
        };
        Update: {
          comment_content?: string | null;
          comment_date_created?: string;
          comment_id?: string;
          comment_is_disabled?: boolean;
          comment_is_edited?: boolean | null;
          comment_last_updated?: string | null;
          comment_request_id?: string;
          comment_team_member_id?: string;
          comment_type?: string;
        };
      };
      field_table: {
        Row: {
          field_description: string | null;
          field_id: string;
          field_is_positive_metric: boolean;
          field_is_required: boolean;
          field_name: string;
          field_order: number;
          field_section_id: string;
          field_type: string;
        };
        Insert: {
          field_description?: string | null;
          field_id?: string;
          field_is_positive_metric?: boolean;
          field_is_required?: boolean;
          field_name: string;
          field_order: number;
          field_section_id: string;
          field_type: string;
        };
        Update: {
          field_description?: string | null;
          field_id?: string;
          field_is_positive_metric?: boolean;
          field_is_required?: boolean;
          field_name?: string;
          field_order?: number;
          field_section_id?: string;
          field_type?: string;
        };
      };
      form_table: {
        Row: {
          form_app: string;
          form_date_created: string;
          form_description: string;
          form_id: string;
          form_is_disabled: boolean;
          form_is_hidden: boolean;
          form_is_signature_required: boolean;
          form_name: string;
          form_team_member_id: string;
        };
        Insert: {
          form_app: string;
          form_date_created?: string;
          form_description: string;
          form_id?: string;
          form_is_disabled?: boolean;
          form_is_hidden?: boolean;
          form_is_signature_required?: boolean;
          form_name: string;
          form_team_member_id: string;
        };
        Update: {
          form_app?: string;
          form_date_created?: string;
          form_description?: string;
          form_id?: string;
          form_is_disabled?: boolean;
          form_is_hidden?: boolean;
          form_is_signature_required?: boolean;
          form_name?: string;
          form_team_member_id?: string;
        };
      };
      invitation_table: {
        Row: {
          invitation_date_created: string;
          invitation_from_team_member_id: string;
          invitation_id: string;
          invitation_to_email: string;
        };
        Insert: {
          invitation_date_created?: string;
          invitation_from_team_member_id: string;
          invitation_id?: string;
          invitation_to_email: string;
        };
        Update: {
          invitation_date_created?: string;
          invitation_from_team_member_id?: string;
          invitation_id?: string;
          invitation_to_email?: string;
        };
      };
      notification_table: {
        Row: {
          notification_app: string;
          notification_content: string;
          notification_date_created: string;
          notification_id: string;
          notification_is_read: boolean;
          notification_redirect_url: string | null;
          notification_team_member_id: string;
          notification_type: string;
        };
        Insert: {
          notification_app: string;
          notification_content: string;
          notification_date_created?: string;
          notification_id?: string;
          notification_is_read?: boolean;
          notification_redirect_url?: string | null;
          notification_team_member_id: string;
          notification_type: string;
        };
        Update: {
          notification_app?: string;
          notification_content?: string;
          notification_date_created?: string;
          notification_id?: string;
          notification_is_read?: boolean;
          notification_redirect_url?: string | null;
          notification_team_member_id?: string;
          notification_type?: string;
        };
      };
      option_table: {
        Row: {
          option_description: string | null;
          option_field_id: string;
          option_id: string;
          option_order: number;
          option_value: string;
        };
        Insert: {
          option_description?: string | null;
          option_field_id: string;
          option_id?: string;
          option_order: number;
          option_value: string;
        };
        Update: {
          option_description?: string | null;
          option_field_id?: string;
          option_id?: string;
          option_order?: number;
          option_value?: string;
        };
      };
      request_response_table: {
        Row: {
          request_response: string;
          request_response_duplicatable_section_id: string | null;
          request_response_field_id: string;
          request_response_id: string;
          request_response_request_id: string;
        };
        Insert: {
          request_response: string;
          request_response_duplicatable_section_id?: string | null;
          request_response_field_id: string;
          request_response_id?: string;
          request_response_request_id: string;
        };
        Update: {
          request_response?: string;
          request_response_duplicatable_section_id?: string | null;
          request_response_field_id?: string;
          request_response_id?: string;
          request_response_request_id?: string;
        };
      };
      request_signer_table: {
        Row: {
          request_signer_id: string;
          request_signer_request_id: string;
          request_signer_signer_id: string;
          request_signer_status: string;
        };
        Insert: {
          request_signer_id?: string;
          request_signer_request_id: string;
          request_signer_signer_id: string;
          request_signer_status?: string;
        };
        Update: {
          request_signer_id?: string;
          request_signer_request_id?: string;
          request_signer_signer_id?: string;
          request_signer_status?: string;
        };
      };
      request_table: {
        Row: {
          request_date_created: string;
          request_form_id: string;
          request_id: string;
          request_is_disabled: boolean;
          request_status: string;
          request_team_member_id: string | null;
        };
        Insert: {
          request_date_created?: string;
          request_form_id: string;
          request_id?: string;
          request_is_disabled?: boolean;
          request_status?: string;
          request_team_member_id?: string | null;
        };
        Update: {
          request_date_created?: string;
          request_form_id?: string;
          request_id?: string;
          request_is_disabled?: boolean;
          request_status?: string;
          request_team_member_id?: string | null;
        };
      };
      section_table: {
        Row: {
          section_form_id: string;
          section_id: string;
          section_is_duplicatable: boolean;
          section_name: string;
          section_order: number;
        };
        Insert: {
          section_form_id: string;
          section_id?: string;
          section_is_duplicatable?: boolean;
          section_name: string;
          section_order: number;
        };
        Update: {
          section_form_id?: string;
          section_id?: string;
          section_is_duplicatable?: boolean;
          section_name?: string;
          section_order?: number;
        };
      };
      signer_table: {
        Row: {
          signer_action: string;
          signer_form_id: string;
          signer_id: string;
          signer_is_primary_signer: boolean;
          signer_order: number;
          signer_team_member_id: string;
        };
        Insert: {
          signer_action: string;
          signer_form_id: string;
          signer_id?: string;
          signer_is_primary_signer?: boolean;
          signer_order: number;
          signer_team_member_id: string;
        };
        Update: {
          signer_action?: string;
          signer_form_id?: string;
          signer_id?: string;
          signer_is_primary_signer?: boolean;
          signer_order?: number;
          signer_team_member_id?: string;
        };
      };
      team_member_table: {
        Row: {
          team_member_date_created: string;
          team_member_disabled: boolean;
          team_member_id: string;
          team_member_role: string;
          team_member_team_id: string;
          team_member_user_id: string;
        };
        Insert: {
          team_member_date_created?: string;
          team_member_disabled?: boolean;
          team_member_id?: string;
          team_member_role?: string;
          team_member_team_id: string;
          team_member_user_id: string;
        };
        Update: {
          team_member_date_created?: string;
          team_member_disabled?: boolean;
          team_member_id?: string;
          team_member_role?: string;
          team_member_team_id?: string;
          team_member_user_id?: string;
        };
      };
      team_table: {
        Row: {
          team_date_created: string;
          team_id: string;
          team_is_disabled: boolean;
          team_is_request_signature_required: boolean;
          team_logo: string | null;
          team_name: string;
          team_user_id: string;
        };
        Insert: {
          team_date_created?: string;
          team_id?: string;
          team_is_disabled?: boolean;
          team_is_request_signature_required?: boolean;
          team_logo?: string | null;
          team_name: string;
          team_user_id: string;
        };
        Update: {
          team_date_created?: string;
          team_id?: string;
          team_is_disabled?: boolean;
          team_is_request_signature_required?: boolean;
          team_logo?: string | null;
          team_name?: string;
          team_user_id?: string;
        };
      };
      user_table: {
        Row: {
          user_active_app: string;
          user_active_team_id: string | null;
          user_avatar: string | null;
          user_date_created: string;
          user_email: string;
          user_first_name: string;
          user_id: string;
          user_is_disabled: boolean;
          user_job_title: string | null;
          user_last_name: string;
          user_phone_number: string | null;
          user_signature_attachment_id: string | null;
          user_username: string;
        };
        Insert: {
          user_active_app?: string;
          user_active_team_id?: string | null;
          user_avatar?: string | null;
          user_date_created?: string;
          user_email: string;
          user_first_name: string;
          user_id?: string;
          user_is_disabled?: boolean;
          user_job_title?: string | null;
          user_last_name: string;
          user_phone_number?: string | null;
          user_signature_attachment_id?: string | null;
          user_username: string;
        };
        Update: {
          user_active_app?: string;
          user_active_team_id?: string | null;
          user_avatar?: string | null;
          user_date_created?: string;
          user_email?: string;
          user_first_name?: string;
          user_id?: string;
          user_is_disabled?: boolean;
          user_job_title?: string | null;
          user_last_name?: string;
          user_phone_number?: string | null;
          user_signature_attachment_id?: string | null;
          user_username?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
