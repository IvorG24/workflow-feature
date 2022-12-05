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
      form_name_table: {
        Row: {
          form_name_id: number;
          form_name: string | null;
        };
        Insert: {
          form_name_id?: never;
          form_name?: string | null;
        };
        Update: {
          form_name_id?: never;
          form_name?: string | null;
        };
      };
      form_priority_table: {
        Row: {
          form_name_id: number;
          priority: number[] | null;
        };
        Insert: {
          form_name_id: number;
          priority?: number[] | null;
        };
        Update: {
          form_name_id?: number;
          priority?: number[] | null;
        };
      };
      form_table: {
        Row: {
          form_id: number;
          form_name_id: number | null;
          form_owner: string | null;
          form_type: Database["public"]["Enums"]["form_type"] | null;
          created_at: string | null;
          question_id: number | null;
          response_value: string[] | null;
          response_owner: string | null;
          response_comment: string | null;
          request_title: string | null;
          request_description: string | null;
          approver_id: string | null;
          approval_status: string | null;
          request_id: number | null;
          on_behalf_of: string | null;
          team_id: string | null;
        };
        Insert: {
          form_id?: never;
          form_name_id?: number | null;
          form_owner?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          created_at?: string | null;
          question_id?: number | null;
          response_value?: string[] | null;
          response_owner?: string | null;
          response_comment?: string | null;
          request_title?: string | null;
          request_description?: string | null;
          approver_id?: string | null;
          approval_status?: string | null;
          request_id?: number | null;
          on_behalf_of?: string | null;
          team_id?: string | null;
        };
        Update: {
          form_id?: never;
          form_name_id?: number | null;
          form_owner?: string | null;
          form_type?: Database["public"]["Enums"]["form_type"] | null;
          created_at?: string | null;
          question_id?: number | null;
          response_value?: string[] | null;
          response_owner?: string | null;
          response_comment?: string | null;
          request_title?: string | null;
          request_description?: string | null;
          approver_id?: string | null;
          approval_status?: string | null;
          request_id?: number | null;
          on_behalf_of?: string | null;
          team_id?: string | null;
        };
      };
      question_table: {
        Row: {
          question_id: number;
          question: string | null;
          expected_response_type:
            | Database["public"]["Enums"]["expected_response_type"]
            | null;
        };
        Insert: {
          question_id?: never;
          question?: string | null;
          expected_response_type?:
            | Database["public"]["Enums"]["expected_response_type"]
            | null;
        };
        Update: {
          question_id?: never;
          question?: string | null;
          expected_response_type?:
            | Database["public"]["Enums"]["expected_response_type"]
            | null;
        };
      };
      request_table: {
        Row: {
          request_id: number;
        };
        Insert: {
          request_id?: never;
        };
        Update: {
          request_id?: never;
        };
      };
      review_score_table: {
        Row: {
          review_score_id: number;
          review_score_name: string | null;
          review_score_value: number | null;
          review_score_comment: string | null;
        };
        Insert: {
          review_score_id?: never;
          review_score_name?: string | null;
          review_score_value?: number | null;
          review_score_comment?: string | null;
        };
        Update: {
          review_score_id?: never;
          review_score_name?: string | null;
          review_score_value?: number | null;
          review_score_comment?: string | null;
        };
      };
      review_table: {
        Row: {
          review_id: number;
          review_source: string | null;
          review_target: string | null;
          review_score: number | null;
          team_id: string | null;
        };
        Insert: {
          review_id?: never;
          review_source?: string | null;
          review_target?: string | null;
          review_score?: number | null;
          team_id?: string | null;
        };
        Update: {
          review_id?: never;
          review_source?: string | null;
          review_target?: string | null;
          review_score?: number | null;
          team_id?: string | null;
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
          team_name: string | null;
          user_id: string | null;
        };
        Insert: {
          team_id?: string;
          team_name?: string | null;
          user_id?: string | null;
        };
        Update: {
          team_id?: string;
          team_name?: string | null;
          user_id?: string | null;
        };
      };
      user_created_select_option_table: {
        Row: {
          question_id: number;
          question_option: string[] | null;
        };
        Insert: {
          question_id: number;
          question_option?: string[] | null;
        };
        Update: {
          question_id?: number;
          question_option?: string[] | null;
        };
      };
      user_profile_table: {
        Row: {
          user_id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          user_id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          user_id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      expected_response_type:
        | "text"
        | "number"
        | "date"
        | "daterange"
        | "time"
        | "email"
        | "select"
        | "slider"
        | "multiple";
      form_type: "request" | "review";
      request_status:
        | "approved"
        | "rejected"
        | "pending"
        | "revision"
        | "stale"
        | "cancelled";
      team_role: "member" | "manager";
    };
  };
};
