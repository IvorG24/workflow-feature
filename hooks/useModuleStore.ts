import { ModuleFormList } from "@/utils/types";
import { create } from "zustand";

type Store = {
  formList: ModuleFormList[];
  actions: {
    setModuleList: (forms: ModuleFormList[]) => void;
    addModule: (form: ModuleFormList) => void;
  };
};

export const useModuleStore = create<Store>((set) => ({
  formList: [],
  actions: {
    setModuleList(forms) {
      set((state) => ({
        ...state,
        formList: forms,
      }));
    },
    addModule(form) {
      set((state) => ({
        ...state,
        formList: [form, ...state.formList],
      }));
    },
  },
}));

export const useModuleList = () => useModuleStore((state) => state.formList);
export const useModuleAction = () => useModuleStore((state) => state.actions);
