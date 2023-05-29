import { UserTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  userInitials: string;
  userProfile: UserTableRow | null;
  userTeamMemberId: string;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
    setUserInitials: (initials: string) => void;
    setUserTeamMemberId: (id: string) => void;
    setUserProfile: (profile: UserTableRow) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  userInitials: "",
  userProfile: null,
  userTeamMemberId: "",
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
    setUserTeamMemberId(id) {
      set((state) => ({
        ...state,
        userTeamMemberId: id,
      }));
    },
  },
}));

export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useUserIntials = () => useUserStore((state) => state.userInitials);
export const useUserTeamMemberId = () =>
  useUserStore((state) => state.userTeamMemberId);
export const useUserActions = () => useUserStore((state) => state.actions);
export const useUserProfile = () => useUserStore((state) => state.userProfile);
