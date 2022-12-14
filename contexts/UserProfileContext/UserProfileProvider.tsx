import React, { useMemo, useReducer } from "react";
import { UserProfileContext, UserProfileType } from "./userProfileContext";
import { userProfileReducer } from "./userProfileReducer";

export const UserProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // ? Save initial state of context fetching here or in app shell?
  // const [createdOrRetrievedUserTeamList, setCreatedOrRetrievedUserTeamList] =
  //   useState<CreateOrRetrieveUserTeamList>([]);

  const [state, dispatchUserProfile] = useReducer<
    typeof userProfileReducer,
    UserProfileType["state"]
  >(userProfileReducer, { userProfile: undefined }, (state) => state);

  const value = useMemo(() => ({ state, dispatchUserProfile }), [state]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
