import { UserTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  userInitials: string;
  userProfile: UserTableRow | null;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
    setUserInitials: (initials: string) => void;
    setUserProfile: (profile: UserTableRow) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  userInitials: "",
  userProfile: null,
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
    setUserProfile(profile) {
      set((state) => ({
        ...state,
        userProfile: profile,
      }));
    },
  },
}));

export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useUserIntials = () => useUserStore((state) => state.userInitials);
export const useUserProfile = () => useUserStore((state) => state.userProfile);
export const useUserActions = () => useUserStore((state) => state.actions);
