import { FetchTeamMemberList } from "@/utils/queries";
import { createContext } from "react";

export enum MemberListActionEnum {
  SET = "SET",
}

export type MemberListActionType = {
  type: MemberListActionEnum;
  payload: MemberListType["state"];
};

export type MemberListType = {
  state: {
    memberList?: FetchTeamMemberList;
  };
  dispatchMemberList: (action: MemberListActionType) => void;
};

export const MemberListContext = createContext<MemberListType | null>(null);

MemberListContext.displayName = "MemberListContext";
