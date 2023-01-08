import { CreateOrRetrieveUserTeamList } from "@/utils/queries-new";
import { createContext } from "react";

const CurrentUserTeamListContext = createContext<CreateOrRetrieveUserTeamList>(
  [] as CreateOrRetrieveUserTeamList
);

export default CurrentUserTeamListContext;
