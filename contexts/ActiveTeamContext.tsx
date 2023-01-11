import { GetTeam } from "@/utils/queries-new";
import { createContext } from "react";

export type ActiveTeamProps = {
  teamMemberList: GetTeam;
  approverIdList: string[]
  purchaserIdList: string[]
};

const ActiveTeamContext = createContext<ActiveTeamProps>({
  teamMemberList: [],
  approverIdList: [],
  purchaserIdList: [],
});

export default ActiveTeamContext;
