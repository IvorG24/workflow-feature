import { MemberListActionType, MemberListActionEnum, MemberListType } from ".";

export const memberListReducer = (
  state: MemberListType["state"],
  action: MemberListActionType
): MemberListType["state"] => {
  switch (action.type) {
    case MemberListActionEnum.SET: {
      return { ...state, memberList: action.payload.memberList };
    }
    default: {
      throw new Error(`Unknown type: ${action.type}`);
    }
  }
};
