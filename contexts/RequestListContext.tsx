import {
  GetRequestApproverList,
  GetRequestCommentList,
  GetTeamRequestList,
} from "@/utils/queries-new";
import { createContext } from "react";

export type RequestProps = {
  requestIdList: number[];
  requestList: GetTeamRequestList;
  requestListCount: number;
  requestApproverList: GetRequestApproverList;
  requestCommentList: GetRequestCommentList;
};

const RequestListContext = createContext<RequestProps | null>(null);

export default RequestListContext;
