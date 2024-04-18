import { JiraItemCategoryDataType, JiraProjectDataType } from "@/utils/types";
import { create } from "zustand";

type Store = {
  jiraProjectData: JiraProjectDataType[];
  jiraItemCategoryData: JiraItemCategoryDataType[];
  actions: {
    setJiraProjectData: (data: JiraProjectDataType[]) => void;
    addJiraProjectData: (data: JiraProjectDataType) => void;
    setJiraItemCategoryData: (data: JiraItemCategoryDataType[]) => void;
    addJiraItemCategoryData: (data: JiraItemCategoryDataType) => void;
  };
};

export const useJiraAutomationData = create<Store>((set) => ({
  jiraProjectData: [],
  jiraItemCategoryData: [],
  actions: {
    setJiraProjectData(newData) {
      set((state) => ({
        ...state,
        jiraProjectData: newData,
      }));
    },
    addJiraProjectData(newData) {
      set((state) => ({
        ...state,
        jiraProjectData: [...state.jiraProjectData, newData],
      }));
    },
    setJiraItemCategoryData(newData) {
      set((state) => ({
        ...state,
        jiraItemCategoryData: newData,
      }));
    },
    addJiraItemCategoryData(newData) {
      set((state) => ({
        ...state,
        jiraItemCategoryData: [...state.jiraItemCategoryData, newData],
      }));
    },
  },
}));

export const useJiraProjectData = () =>
  useJiraAutomationData((state) => state.jiraProjectData);
export const useJiraItemCategoryData = () =>
  useJiraAutomationData((state) => state.jiraItemCategoryData);
export const useJiraAutomationActions = () =>
  useJiraAutomationData((state) => state.actions);
