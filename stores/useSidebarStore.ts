import { create } from "zustand";
import { SidebarStorePreference } from "@/utils/types";

type Store = {
  preferences: SidebarStorePreference;
  initializePreferences: () => void;
  setUpdatedPreference: (section: string, value: boolean) => void;
};

export const useSidebarStore = create<Store>((set, get) => ({
  preferences: {
    metrics: false,
    humanResources: false,
    create: false,
    list: false,
    form: false,
    team: false,
    jira: false,
  },
  initializePreferences: async () => {
    try {
        const storedPreferences = JSON.parse(
          localStorage.getItem("sidebar-preferences") || "{}"
        );
        if (storedPreferences) {
          set({ preferences: storedPreferences });
        }
    } catch (error) {
      console.error("Error initializing sidebar preferences:", error);
    }
  },

  setUpdatedPreference: (section, value) => {
    const currentPreferences = get().preferences;
    const updatedPreferences = {
      ...currentPreferences,
      [section]: value,
    };
    set({ preferences: updatedPreferences });
    localStorage.setItem(
      "sidebar-preferences",
      JSON.stringify(updatedPreferences)
    );
  },
}));
