import { create } from "zustand";

type Store = {
  userAvatar: string | null;
  userInitials: string;
  userTeamMemberId: string;
  actions: {
    setUserAvatar: (avatar: string | null) => void;
    setUserInitials: (initials: string) => void;
    setUserTeamMemberId: (id: string) => void;
  };
};

export const useUserStore = create<Store>((set) => ({
  userAvatar: null,
  userInitials: "",
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
