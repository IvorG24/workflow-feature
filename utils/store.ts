import { FormTableRow, TeamTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  activeTeam: TeamTableRow;
  activeApp: string;
  teamList: TeamTableRow[];
  formList: FormTableRow[];
  setActiveTeam: (team: TeamTableRow) => void;
  setActiveApp: (app: string) => void;
  setTeamList: (teams: TeamTableRow[]) => void;
  setFormList: (forms: FormTableRow[]) => void;
};

export const useStore = create<Store>((set) => ({
  activeTeam: {} as TeamTableRow,
  activeApp: "",
  teamList: [],
  formList: [],
  setActiveTeam(team) {
    set((state) => ({
      ...state,
      activeTeam: team,
    }));
  },
  setActiveApp(app) {
    set((state) => ({
      ...state,
      activeApp: app,
    }));
  },
  setTeamList(teams) {
    set((state) => ({
      ...state,
      teamList: teams,
    }));
  },
  setFormList(forms) {
    set((state) => ({
      ...state,
      formList: forms,
    }));
  },
}));
