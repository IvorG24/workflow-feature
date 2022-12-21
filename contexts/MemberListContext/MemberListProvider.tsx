import React, { useMemo, useReducer } from "react";
import { MemberListContext, MemberListType } from "./memberListContext";
import { memberListReducer } from "./memberListReducer";

export const MemberListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchMemberList] = useReducer<
    typeof memberListReducer,
    MemberListType["state"]
  >(memberListReducer, { memberList: [] }, (state) => state);

  const value = useMemo(() => ({ state, dispatchMemberList }), [state]);

  return (
    <MemberListContext.Provider value={value}>
      {children}
    </MemberListContext.Provider>
  );
};
