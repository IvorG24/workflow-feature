import { RequestType } from "@/utils/types";
import { create } from "zustand";

type Store = {
  requestList: RequestType[];
  isFetchingRequestList: boolean;
  actions: {
    setRequestList: (requests: RequestType[]) => void;
    setIsFetchingRequestList: (status: boolean) => void;
  };
};

export const useRequestListStore = create<Store>((set) => ({
  requestList: [],
  isFetchingRequestList: false,
  actions: {
    setRequestList(requests) {
      set((state) => ({
        ...state,
        requestList: requests,
      }));
    },
    setIsFetchingRequestList(status) {
      set((state) => ({
        ...state,
        isFetchingRequestList: status,
      }));
    },
  },
}));

export const useRequestList = () =>
  useRequestListStore((state) => state.requestList);
export const useRequestActions = () =>
  useRequestListStore((state) => state.actions);
