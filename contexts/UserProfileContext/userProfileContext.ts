import { CreatedOrRetrievedUser } from "@/utils/queries";
import { createContext } from "react";

// ? What are the actions? Only a set? Or a get?
// Action with parameter

export enum UserProfileActionEnum {
  SET = "SET",
}

export type ActionType = {
  type: UserProfileActionEnum;
  payload: UserProfileType["state"];
};

export type UserProfileType = {
  state: {
    userProfile?: CreatedOrRetrievedUser;
  };
  dispatchUserProfile: (action: ActionType) => void;
};

export const UserProfileContext = createContext<UserProfileType | null>(null);

UserProfileContext.displayName = "UserProfileContext";
