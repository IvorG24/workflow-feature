import { GetUserProfile } from "@/utils/queries-new";
import { createContext } from "react";

const MemberProfileContext = createContext<GetUserProfile | null>(null);

export default MemberProfileContext;
