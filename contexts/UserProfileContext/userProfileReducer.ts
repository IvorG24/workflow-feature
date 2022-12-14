import { ActionType, UserProfileActionEnum, UserProfileType } from ".";

export const userProfileReducer = (
  state: UserProfileType["state"],
  action: ActionType
): UserProfileType["state"] => {
  switch (action.type) {
    case UserProfileActionEnum.SET: {
      return { ...state, userProfile: action.payload.userProfile };
    }
    default: {
      throw new Error(`Unknown type: ${action.type}`);
    }
  }
};

