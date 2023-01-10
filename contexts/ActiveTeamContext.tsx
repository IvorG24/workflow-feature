import { GetTeam } from "@/utils/queries-new";
import { createContext } from "react";

const ActiveTeamContext = createContext<GetTeam>([]);

export default ActiveTeamContext;
