import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  userInitials: string;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
    setUserInitials: (initials: string) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  userInitials: "",
  actions: {
    setUserAvatar(avatar) {
      set((state) => ({
        ...state,
        userAvatar: avatar,
      }));
    },
    setUserInitials(initials) {
      set((state) => ({
        ...state,
        userInitials: initials,
      }));
    },
  },
}));

export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useUserIntials = () => useUserStore((state) => state.userInitials);
export const useUserActions = () => useUserStore((state) => state.actions);
