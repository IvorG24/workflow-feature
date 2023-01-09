import {
  GetRequestWithApproverList,
  GetTeamRequestList,
} from "@/utils/queries-new";
import { createContext } from "react";

export type RequestListProps = {
  requestList: GetTeamRequestList;
  requestWithApproverList: GetRequestWithApproverList;
  setRequestList?: React.Dispatch<React.SetStateAction<GetTeamRequestList>>;
  setRequestWithApproverList?: React.Dispatch<
    React.SetStateAction<GetRequestWithApproverList>
  >;
};

const RequestListContext = createContext<RequestListProps>({
  requestList: [],
  requestWithApproverList: {},
} as RequestListProps);

export default RequestListContext;
