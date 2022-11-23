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
          created_at: string | null;
          question_id: number | null;
          response_value: string | null;
          response_owner: string | null;
          response_comment: string | null;
          team_id: number | null;
        };
        Insert: {
          form_id?: never;
          form_name_id?: number | null;
          created_at?: string | null;
          question_id?: number | null;
          response_value?: string | null;
          response_owner?: string | null;
          response_comment?: string | null;
          team_id?: number | null;
        };
        Update: {
          form_id?: never;
          form_name_id?: number | null;
          created_at?: string | null;
          question_id?: number | null;
          response_value?: string | null;
          response_owner?: string | null;
          response_comment?: string | null;
          team_id?: number | null;
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
      team_role_table: {
        Row: {
          team_id: number;
          user_id: string;
          team_role: Database["public"]["Enums"]["team_role"] | null;
          lock_account: boolean | null;
        };
        Insert: {
          team_id: number;
          user_id: string;
          team_role?: Database["public"]["Enums"]["team_role"] | null;
          lock_account?: boolean | null;
        };
        Update: {
          team_id?: number;
          user_id?: string;
          team_role?: Database["public"]["Enums"]["team_role"] | null;
          lock_account?: boolean | null;
        };
      };
      team_table: {
        Row: {
          team_id: number;
          team_name: string | null;
          user_id: string | null;
        };
        Insert: {
          team_id?: never;
          team_name?: string | null;
          user_id?: string | null;
        };
        Update: {
          team_id?: never;
          team_name?: string | null;
          user_id?: string | null;
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
      team_role: "member" | "manager";
    };
  };
};
