export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "comment_table_comment_request_id_fkey";
            columns: ["comment_request_id"];
            referencedRelation: "request_table";
            referencedColumns: ["request_id"];
          },
          {
            foreignKeyName: "comment_table_comment_request_id_fkey";
            columns: ["comment_request_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_id"];
          },
          {
            foreignKeyName: "comment_table_comment_team_member_id_fkey";
            columns: ["comment_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          }
        ];
      };
      field_table: {
        Row: {
          field_description: string | null;
          field_id: string;
          field_is_positive_metric: boolean;
          field_is_read_only: boolean;
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
          field_is_read_only?: boolean;
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
          field_is_read_only?: boolean;
          field_is_required?: boolean;
          field_name?: string;
          field_order?: number;
          field_section_id?: string;
          field_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "field_table_field_section_id_fkey";
            columns: ["field_section_id"];
            referencedRelation: "section_table";
            referencedColumns: ["section_id"];
          }
        ];
      };
      form_table: {
        Row: {
          form_app: string;
          form_date_created: string;
          form_description: string;
          form_group: string[];
          form_id: string;
          form_is_disabled: boolean;
          form_is_for_every_member: boolean;
          form_is_formsly_form: boolean;
          form_is_hidden: boolean;
          form_is_signature_required: boolean;
          form_name: string;
          form_team_member_id: string;
        };
        Insert: {
          form_app: string;
          form_date_created?: string;
          form_description: string;
          form_group?: string[];
          form_id?: string;
          form_is_disabled?: boolean;
          form_is_for_every_member?: boolean;
          form_is_formsly_form?: boolean;
          form_is_hidden?: boolean;
          form_is_signature_required?: boolean;
          form_name: string;
          form_team_member_id: string;
        };
        Update: {
          form_app?: string;
          form_date_created?: string;
          form_description?: string;
          form_group?: string[];
          form_id?: string;
          form_is_disabled?: boolean;
          form_is_for_every_member?: boolean;
          form_is_formsly_form?: boolean;
          form_is_hidden?: boolean;
          form_is_signature_required?: boolean;
          form_name?: string;
          form_team_member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_table_form_team_member_id_fkey";
            columns: ["form_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          }
        ];
      };
      invitation_table: {
        Row: {
          invitation_date_created: string;
          invitation_from_team_member_id: string;
          invitation_id: string;
          invitation_is_disabled: boolean;
          invitation_status: string;
          invitation_to_email: string;
        };
        Insert: {
          invitation_date_created?: string;
          invitation_from_team_member_id: string;
          invitation_id?: string;
          invitation_is_disabled?: boolean;
          invitation_status?: string;
          invitation_to_email: string;
        };
        Update: {
          invitation_date_created?: string;
          invitation_from_team_member_id?: string;
          invitation_id?: string;
          invitation_is_disabled?: boolean;
          invitation_status?: string;
          invitation_to_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitation_table_invitation_from_team_member_id_fkey";
            columns: ["invitation_from_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          }
        ];
      };
      item_description_field_table: {
        Row: {
          item_description_field_date_created: string;
          item_description_field_id: string;
          item_description_field_is_available: boolean;
          item_description_field_is_disabled: boolean;
          item_description_field_item_description_id: string;
          item_description_field_value: string;
        };
        Insert: {
          item_description_field_date_created?: string;
          item_description_field_id?: string;
          item_description_field_is_available?: boolean;
          item_description_field_is_disabled?: boolean;
          item_description_field_item_description_id: string;
          item_description_field_value: string;
        };
        Update: {
          item_description_field_date_created?: string;
          item_description_field_id?: string;
          item_description_field_is_available?: boolean;
          item_description_field_is_disabled?: boolean;
          item_description_field_item_description_id?: string;
          item_description_field_value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_description_field_table_item_description_field_item_d_fkey";
            columns: ["item_description_field_item_description_id"];
            referencedRelation: "item_description_table";
            referencedColumns: ["item_description_id"];
          }
        ];
      };
      item_description_table: {
        Row: {
          item_description_date_created: string;
          item_description_field_id: string;
          item_description_id: string;
          item_description_is_available: boolean;
          item_description_is_disabled: boolean;
          item_description_item_id: string;
          item_description_label: string;
        };
        Insert: {
          item_description_date_created?: string;
          item_description_field_id: string;
          item_description_id?: string;
          item_description_is_available?: boolean;
          item_description_is_disabled?: boolean;
          item_description_item_id: string;
          item_description_label: string;
        };
        Update: {
          item_description_date_created?: string;
          item_description_field_id?: string;
          item_description_id?: string;
          item_description_is_available?: boolean;
          item_description_is_disabled?: boolean;
          item_description_item_id?: string;
          item_description_label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_description_table_item_description_field_id_fkey";
            columns: ["item_description_field_id"];
            referencedRelation: "field_table";
            referencedColumns: ["field_id"];
          },
          {
            foreignKeyName: "item_description_table_item_description_item_id_fkey";
            columns: ["item_description_item_id"];
            referencedRelation: "item_table";
            referencedColumns: ["item_id"];
          }
        ];
      };
      item_table: {
        Row: {
          item_cost_code: string;
          item_date_created: string;
          item_general_name: string;
          item_gl_account: string;
          item_id: string;
          item_is_available: boolean;
          item_is_disabled: boolean;
          item_purpose: string;
          item_team_id: string;
          item_unit: string;
        };
        Insert: {
          item_cost_code: string;
          item_date_created?: string;
          item_general_name: string;
          item_gl_account: string;
          item_id?: string;
          item_is_available?: boolean;
          item_is_disabled?: boolean;
          item_purpose: string;
          item_team_id: string;
          item_unit: string;
        };
        Update: {
          item_cost_code?: string;
          item_date_created?: string;
          item_general_name?: string;
          item_gl_account?: string;
          item_id?: string;
          item_is_available?: boolean;
          item_is_disabled?: boolean;
          item_purpose?: string;
          item_team_id?: string;
          item_unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_table_item_team_id_fkey";
            columns: ["item_team_id"];
            referencedRelation: "team_table";
            referencedColumns: ["team_id"];
          }
        ];
      };
      notification_table: {
        Row: {
          notification_app: string;
          notification_content: string;
          notification_date_created: string;
          notification_id: string;
          notification_is_read: boolean;
          notification_redirect_url: string | null;
          notification_team_id: string | null;
          notification_type: string;
          notification_user_id: string;
        };
        Insert: {
          notification_app: string;
          notification_content: string;
          notification_date_created?: string;
          notification_id?: string;
          notification_is_read?: boolean;
          notification_redirect_url?: string | null;
          notification_team_id?: string | null;
          notification_type: string;
          notification_user_id: string;
        };
        Update: {
          notification_app?: string;
          notification_content?: string;
          notification_date_created?: string;
          notification_id?: string;
          notification_is_read?: boolean;
          notification_redirect_url?: string | null;
          notification_team_id?: string | null;
          notification_type?: string;
          notification_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_table_notification_team_id_fkey";
            columns: ["notification_team_id"];
            referencedRelation: "team_table";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "notification_table_notification_user_id_fkey";
            columns: ["notification_user_id"];
            referencedRelation: "user_table";
            referencedColumns: ["user_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "option_table_option_field_id_fkey";
            columns: ["option_field_id"];
            referencedRelation: "field_table";
            referencedColumns: ["field_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "request_response_table_request_response_field_id_fkey";
            columns: ["request_response_field_id"];
            referencedRelation: "field_table";
            referencedColumns: ["field_id"];
          },
          {
            foreignKeyName: "request_response_table_request_response_request_id_fkey";
            columns: ["request_response_request_id"];
            referencedRelation: "request_table";
            referencedColumns: ["request_id"];
          },
          {
            foreignKeyName: "request_response_table_request_response_request_id_fkey";
            columns: ["request_response_request_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "request_signer_table_request_signer_request_id_fkey";
            columns: ["request_signer_request_id"];
            referencedRelation: "request_table";
            referencedColumns: ["request_id"];
          },
          {
            foreignKeyName: "request_signer_table_request_signer_request_id_fkey";
            columns: ["request_signer_request_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_id"];
          },
          {
            foreignKeyName: "request_signer_table_request_signer_signer_id_fkey";
            columns: ["request_signer_signer_id"];
            referencedRelation: "signer_table";
            referencedColumns: ["signer_id"];
          }
        ];
      };
      request_table: {
        Row: {
          request_additional_info: string | null;
          request_date_created: string;
          request_form_id: string;
          request_id: string;
          request_is_disabled: boolean;
          request_status: string;
          request_team_member_id: string | null;
        };
        Insert: {
          request_additional_info?: string | null;
          request_date_created?: string;
          request_form_id: string;
          request_id?: string;
          request_is_disabled?: boolean;
          request_status?: string;
          request_team_member_id?: string | null;
        };
        Update: {
          request_additional_info?: string | null;
          request_date_created?: string;
          request_form_id?: string;
          request_id?: string;
          request_is_disabled?: boolean;
          request_status?: string;
          request_team_member_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "request_table_request_form_id_fkey";
            columns: ["request_form_id"];
            referencedRelation: "form_table";
            referencedColumns: ["form_id"];
          },
          {
            foreignKeyName: "request_table_request_form_id_fkey";
            columns: ["request_form_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_form_id"];
          },
          {
            foreignKeyName: "request_table_request_team_member_id_fkey";
            columns: ["request_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "section_table_section_form_id_fkey";
            columns: ["section_form_id"];
            referencedRelation: "form_table";
            referencedColumns: ["form_id"];
          },
          {
            foreignKeyName: "section_table_section_form_id_fkey";
            columns: ["section_form_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_form_id"];
          }
        ];
      };
      signer_table: {
        Row: {
          signer_action: string;
          signer_form_id: string;
          signer_id: string;
          signer_is_disabled: boolean;
          signer_is_primary_signer: boolean;
          signer_order: number;
          signer_team_member_id: string;
        };
        Insert: {
          signer_action: string;
          signer_form_id: string;
          signer_id?: string;
          signer_is_disabled?: boolean;
          signer_is_primary_signer?: boolean;
          signer_order: number;
          signer_team_member_id: string;
        };
        Update: {
          signer_action?: string;
          signer_form_id?: string;
          signer_id?: string;
          signer_is_disabled?: boolean;
          signer_is_primary_signer?: boolean;
          signer_order?: number;
          signer_team_member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "signer_table_signer_form_id_fkey";
            columns: ["signer_form_id"];
            referencedRelation: "form_table";
            referencedColumns: ["form_id"];
          },
          {
            foreignKeyName: "signer_table_signer_form_id_fkey";
            columns: ["signer_form_id"];
            referencedRelation: "request_list_table_view";
            referencedColumns: ["request_form_id"];
          },
          {
            foreignKeyName: "signer_table_signer_team_member_id_fkey";
            columns: ["signer_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          }
        ];
      };
      supplier_table: {
        Row: {
          supplier_date_created: string;
          supplier_id: string;
          supplier_is_available: boolean;
          supplier_is_disabled: boolean;
          supplier_name: string;
          supplier_team_id: string;
        };
        Insert: {
          supplier_date_created?: string;
          supplier_id?: string;
          supplier_is_available?: boolean;
          supplier_is_disabled?: boolean;
          supplier_name: string;
          supplier_team_id: string;
        };
        Update: {
          supplier_date_created?: string;
          supplier_id?: string;
          supplier_is_available?: boolean;
          supplier_is_disabled?: boolean;
          supplier_name?: string;
          supplier_team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_table_supplier_team_id_fkey";
            columns: ["supplier_team_id"];
            referencedRelation: "team_table";
            referencedColumns: ["team_id"];
          }
        ];
      };
      team_member_table: {
        Row: {
          team_member_date_created: string;
          team_member_group_list: string[];
          team_member_id: string;
          team_member_is_disabled: boolean;
          team_member_project_list: string[];
          team_member_role: string;
          team_member_team_id: string;
          team_member_user_id: string;
        };
        Insert: {
          team_member_date_created?: string;
          team_member_group_list?: string[];
          team_member_id?: string;
          team_member_is_disabled?: boolean;
          team_member_project_list?: string[];
          team_member_role?: string;
          team_member_team_id: string;
          team_member_user_id: string;
        };
        Update: {
          team_member_date_created?: string;
          team_member_group_list?: string[];
          team_member_id?: string;
          team_member_is_disabled?: boolean;
          team_member_project_list?: string[];
          team_member_role?: string;
          team_member_team_id?: string;
          team_member_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_member_table_team_member_team_id_fkey";
            columns: ["team_member_team_id"];
            referencedRelation: "team_table";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "team_member_table_team_member_user_id_fkey";
            columns: ["team_member_user_id"];
            referencedRelation: "user_table";
            referencedColumns: ["user_id"];
          }
        ];
      };
      team_table: {
        Row: {
          team_date_created: string;
          team_group_list: string[];
          team_id: string;
          team_is_disabled: boolean;
          team_is_request_signature_required: boolean;
          team_logo: string | null;
          team_name: string;
          team_project_list: string[];
          team_user_id: string;
        };
        Insert: {
          team_date_created?: string;
          team_group_list?: string[];
          team_id?: string;
          team_is_disabled?: boolean;
          team_is_request_signature_required?: boolean;
          team_logo?: string | null;
          team_name: string;
          team_project_list?: string[];
          team_user_id: string;
        };
        Update: {
          team_date_created?: string;
          team_group_list?: string[];
          team_id?: string;
          team_is_disabled?: boolean;
          team_is_request_signature_required?: boolean;
          team_logo?: string | null;
          team_name?: string;
          team_project_list?: string[];
          team_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_table_team_user_id_fkey";
            columns: ["team_user_id"];
            referencedRelation: "user_table";
            referencedColumns: ["user_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "user_table_user_signature_attachment_id_fkey";
            columns: ["user_signature_attachment_id"];
            referencedRelation: "attachment_table";
            referencedColumns: ["attachment_id"];
          }
        ];
      };
    };
    Views: {
      request_list_table_view: {
        Row: {
          form_description: string | null;
          form_name: string | null;
          request_date_created: string | null;
          request_form_id: string | null;
          request_id: string | null;
          request_requestor: Json | null;
          request_signers: Json | null;
          request_status: string | null;
          request_team_id: string | null;
          request_team_member_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "request_table_request_team_member_id_fkey";
            columns: ["request_team_member_id"];
            referencedRelation: "team_member_table";
            referencedColumns: ["team_member_id"];
          },
          {
            foreignKeyName: "team_member_table_team_member_team_id_fkey";
            columns: ["request_team_id"];
            referencedRelation: "team_table";
            referencedColumns: ["team_id"];
          }
        ];
      };
    };
    Functions: {
      create_formsly_premade_forms: {
        Args: {
          input_data: Json;
        };
        Returns: undefined;
      };
      create_item: {
        Args: {
          input_data: Json;
        };
        Returns: Json;
      };
      create_request: {
        Args: {
          input_data: Json;
        };
        Returns: Json;
      };
      create_team_invitation: {
        Args: {
          input_data: Json;
        };
        Returns: Json;
      };
      create_user: {
        Args: {
          input_data: Json;
        };
        Returns: Json;
      };
      get_current_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_ssot: {
        Args: {
          input_data: Json;
        };
        Returns: Json;
      };
      split_otp: {
        Args: {
          input_data: Json;
        };
        Returns: undefined;
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
