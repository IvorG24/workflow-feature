import { GetRequest, GetRequestWithApproverList } from "@/utils/queries-new";
import { createContext } from "react";

export type RequestProps = {
  request: GetRequest;
  requestWithApproverList: GetRequestWithApproverList;
  // setRequest?: (request: GetRequest) => void;
  // setRequestWithApproverList?: (
  //   requestWithApproverList: GetRequestWithApproverList
  // ) => void;
  setRequest?: React.Dispatch<React.SetStateAction<GetRequest>>;
  setRequestWithApproverList?: React.Dispatch<
    React.SetStateAction<GetRequestWithApproverList>
  >;
};

const RequestContext = createContext<RequestProps>({
  request: {},
  requestWithApproverList: {},
} as RequestProps);

export default RequestContext;
