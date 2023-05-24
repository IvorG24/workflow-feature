import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  actions: {
    setUserAvatar(avatar) {
      set((state) => ({
        ...state,
        userAvatar: avatar,
      }));
    },
  },
}));

export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useUserActions = () => useUserStore((state) => state.actions);
