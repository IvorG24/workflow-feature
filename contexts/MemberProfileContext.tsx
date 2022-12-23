import { UserProfileTableRow } from "@/utils/types";
import { createContext } from "react";

const MemberProfileContext = createContext<UserProfileTableRow | null>(null);

export default MemberProfileContext;
