import { TeamMemberTableRow, UserTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  userInitials: string;
  userProfile: UserTableRow | null;
  userTeamMember: TeamMemberTableRow | null;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
    setUserInitials: (initials: string) => void;
    setUserTeamMember: (member: TeamMemberTableRow) => void;
    setUserProfile: (profile: UserTableRow) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  userInitials: "",
  userProfile: null,
  userTeamMember: null,
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
    setUserTeamMember(teamMember) {
      set((state) => ({
        ...state,
        userTeamMember: teamMember,
      }));
    },
  },
}));

export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useUserIntials = () => useUserStore((state) => state.userInitials);
export const useUserTeamMember = () =>
  useUserStore((state) => state.userTeamMember);
export const useUserActions = () => useUserStore((state) => state.actions);
export const useUserProfile = () => useUserStore((state) => state.userProfile);
