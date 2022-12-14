import { useContext } from "react";
import { UserProfileContext } from "./userProfileContext";

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "useUserProfileContext must be used within a UserProfileContextProvider"
    );
  }

  return context;
};
