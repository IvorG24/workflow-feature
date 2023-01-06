import { GetTeam } from "@/utils/queries-new";
import { createContext } from "react";

const ActiveTeamContext = createContext<GetTeam>(undefined);

export default ActiveTeamContext;
