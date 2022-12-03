import type { Database } from "./database.types";

export type { Database } from "./database.types";
export type UserProfile =
  Database["public"]["Tables"]["user_profile_table"]["Row"];

export type FormTable = Database["public"]["Tables"]["form_table"]["Row"];
