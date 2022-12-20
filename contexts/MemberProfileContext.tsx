import { UserProfileTableRow } from "@/utils/types";
import { createContext } from "react";

export const MemberProfileContext = createContext<UserProfileTableRow | null>(
  null
);
