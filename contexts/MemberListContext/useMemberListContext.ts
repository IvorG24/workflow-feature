import { useContext } from "react";
import { MemberListContext } from "./memberListContext";

export const useMemberListContext = () => {
  const context = useContext(MemberListContext);
  if (!context) {
    throw new Error(
      "useMemberListContext must be used within a useMemberListContextProvider"
    );
  }
  return context;
};
