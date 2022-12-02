import type { Database } from "./database.types";

export type { Database } from "./database.types";
export type UserProfile =
  Database["public"]["Tables"]["user_profile_table"]["Row"];
export type Team = Database["public"]["Tables"]["team_table"]["Row"];
