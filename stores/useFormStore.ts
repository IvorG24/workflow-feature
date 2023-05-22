import { FormTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  formList: FormTableRow[];
  actions: {
    setFormList: (forms: FormTableRow[]) => void;
  };
};

export const useFormStore = create<Store>((set) => ({
  formList: [],
  actions: {
    setFormList(forms) {
      set((state) => ({
        ...state,
        formList: forms,
      }));
    },
  },
}));

export const useFormList = () => useFormStore((state) => state.formList);
export const useFormActions = () => useFormStore((state) => state.actions);
