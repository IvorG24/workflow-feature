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
      field_table: {
        Row: {
          field_id: number
          field_name: string | null
          field_type: Database["public"]["Enums"]["field_type"] | null
          field_option: string[] | null
          is_required: boolean | null
          field_tooltip: string | null
          form_table_id: number | null
        }
        Insert: {
          field_id?: never
          field_name?: string | null
          field_type?: Database["public"]["Enums"]["field_type"] | null
          field_option?: string[] | null
          is_required?: boolean | null
          field_tooltip?: string | null
          form_table_id?: number | null
        }
        Update: {
          field_id?: never
          field_name?: string | null
          field_type?: Database["public"]["Enums"]["field_type"] | null
          field_option?: string[] | null
          is_required?: boolean | null
          field_tooltip?: string | null
          form_table_id?: number | null
        }
      }
      form_table: {
        Row: {
          form_id: number
          form_name: string | null
          form_owner: string | null
          team_id: string | null
          form_type: Database["public"]["Enums"]["form_type"] | null
          form_priority: number[] | null
        }
        Insert: {
          form_id?: never
          form_name?: string | null
          form_owner?: string | null
          team_id?: string | null
          form_type?: Database["public"]["Enums"]["form_type"] | null
          form_priority?: number[] | null
        }
        Update: {
          form_id?: never
          form_name?: string | null
          form_owner?: string | null
          team_id?: string | null
          form_type?: Database["public"]["Enums"]["form_type"] | null
          form_priority?: number[] | null
        }
      }
      request_response_table: {
        Row: {
          field_id: number
          response_value: string | null
          request_id: number
        }
        Insert: {
          field_id: number
          response_value?: string | null
          request_id: number
        }
        Update: {
          field_id?: number
          response_value?: string | null
          request_id?: number
        }
      }
      request_table: {
        Row: {
          request_id: number
          approver_id: string | null
          requested_by: string | null
          request_created_at: string | null
          request_status_updated_at: string | null
          form_table_id: number | null
          request_title: string | null
          on_behalf_of: string | null
          request_description: string | null
        }
        Insert: {
          request_id?: never
          approver_id?: string | null
          requested_by?: string | null
          request_created_at?: string | null
          request_status_updated_at?: string | null
          form_table_id?: number | null
          request_title?: string | null
          on_behalf_of?: string | null
          request_description?: string | null
        }
        Update: {
          request_id?: never
          approver_id?: string | null
          requested_by?: string | null
          request_created_at?: string | null
          request_status_updated_at?: string | null
          form_table_id?: number | null
          request_title?: string | null
          on_behalf_of?: string | null
          request_description?: string | null
        }
      }
      review_response_table: {
        Row: {
          field_id: number
          response_value: string | null
          review_id: number
        }
        Insert: {
          field_id: number
          response_value?: string | null
          review_id: number
        }
        Update: {
          field_id?: number
          response_value?: string | null
          review_id?: number
        }
      }
      review_table: {
        Row: {
          review_id: number
          form_table_id: number | null
          review_source: string | null
          review_target: string | null
          review_created_at: string | null
        }
        Insert: {
          review_id?: never
          form_table_id?: number | null
          review_source?: string | null
          review_target?: string | null
          review_created_at?: string | null
        }
        Update: {
          review_id?: never
          form_table_id?: number | null
          review_source?: string | null
          review_target?: string | null
          review_created_at?: string | null
        }
      }
      team_role_table: {
        Row: {
          user_id: string
          team_id: string
          team_role: Database["public"]["Enums"]["team_role"] | null
          lock_account: boolean | null
        }
        Insert: {
          user_id: string
          team_id: string
          team_role?: Database["public"]["Enums"]["team_role"] | null
          lock_account?: boolean | null
        }
        Update: {
          user_id?: string
          team_id?: string
          team_role?: Database["public"]["Enums"]["team_role"] | null
          lock_account?: boolean | null
        }
      }
      team_table: {
        Row: {
          team_id: string
          team_name: string | null
          user_id: string | null
        }
        Insert: {
          team_id?: string
          team_name?: string | null
          user_id?: string | null
        }
        Update: {
          team_id?: string
          team_name?: string | null
          user_id?: string | null
        }
      }
      user_profile_table: {
        Row: {
          user_id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          email: string | null
        }
        Insert: {
          user_id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
        Update: {
          user_id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
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
      form_type: "request" | "review"
      request_status:
        | "approved"
        | "rejected"
        | "pending"
        | "revision"
        | "stale"
        | "cancelled"
      review_type: "hr" | "peer" | "employee"
      team_role: "owner" | "admin" | "member"
    }
  }
}
