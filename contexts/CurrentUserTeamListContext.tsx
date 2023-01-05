import { CreateOrRetrieveUserTeamList } from "@/utils/queries-new";
import { createContext } from "react";

const CurrentUserTeamListContext =
  createContext<CreateOrRetrieveUserTeamList>(undefined);

export default CurrentUserTeamListContext;
