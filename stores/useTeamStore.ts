import { TeamTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  activeTeam: TeamTableRow;
  teamList: TeamTableRow[];
  actions: {
    setActiveTeam: (team: TeamTableRow) => void;
    setTeamList: (teams: TeamTableRow[]) => void;
  };
};

const useTeamStore = create<Store>((set) => ({
  activeTeam: {} as TeamTableRow,
  teamList: [],
  actions: {
    setActiveTeam: (team) => {
      set((state) => ({
        ...state,
        activeTeam: team,
      }));
    },
    setTeamList: (teams) => {
      set((state) => ({
        ...state,
        teamList: teams,
      }));
    },
  },
}));

export const useActiveTeam = () => useTeamStore((state) => state.activeTeam);
export const useTeamList = () => useTeamStore((state) => state.teamList);
export const useTeamActions = () => useTeamStore((state) => state.actions);
