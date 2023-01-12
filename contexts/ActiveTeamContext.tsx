import { GetTeam } from "@/utils/queries-new";
import { createContext, Dispatch, SetStateAction } from "react";

export type ActiveTeamProps = {
  teamMemberList: GetTeam;
  approverIdList: string[];
  purchaserIdList: string[];
  setActiveTeam?: Dispatch<SetStateAction<ActiveTeamProps>>;
};

const ActiveTeamContext = createContext<ActiveTeamProps>({
  teamMemberList: [],
  approverIdList: [],
  purchaserIdList: [],
});
export default ActiveTeamContext;
