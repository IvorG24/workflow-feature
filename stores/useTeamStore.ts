import { TeamTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  activeApp: string;
  activeTeam: TeamTableRow;
  teamList: TeamTableRow[];
  actions: {
    setActiveApp: (app: string) => void;
    setActiveTeam: (team: TeamTableRow) => void;
    setTeamList: (teams: TeamTableRow[]) => void;
  };
};

const useTeamStore = create<Store>((set) => ({
  activeApp: "",
  activeTeam: {} as TeamTableRow,
  teamList: [],
  actions: {
    setActiveApp: (app) => {
      set((state) => ({
        ...state,
        activeApp: app,
      }));
    },
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

export const useActiveApp = () => useTeamStore((state) => state.activeApp);
export const useActiveTeam = () => useTeamStore((state) => state.activeTeam);
export const useTeamList = () => useTeamStore((state) => state.teamList);
export const useTeamActions = () => useTeamStore((state) => state.actions);
