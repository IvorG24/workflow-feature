import { create } from "zustand";
import { SidebarPreference, SidebarStorePreference } from "@/utils/types";

type Store = {
  preferences: SidebarStorePreference;
  initializePreferences: (data: SidebarPreference) => void;
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
  initializePreferences: async (data) => {
    try {
      if (!data) {
        //if there's no data from server, it checks if the user has any preferences stored in local storage
        const storedPreferences = JSON.parse(
          localStorage.getItem("sidebar-preferences") || "{}"
        );
        if (storedPreferences) {
          set({ preferences: storedPreferences });
        }
      } else {
        const preferences = {
          metrics: data.user_sidebar_preference_metrics,
          humanResources: data.user_sidebar_preference_human_resources,
          create: data.user_sidebar_preference_create,
          list: data.user_sidebar_preference_list,
          form: data.user_sidebar_preference_form,
          team: data.user_sidebar_preference_team,
          jira: data.user_sidebar_preference_jira,
        };
        set({ preferences });
        localStorage.setItem(
          "sidebar-preferences",
          JSON.stringify(preferences)
        );
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
