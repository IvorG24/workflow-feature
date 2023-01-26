import { GetRequest, GetRequestApproverList } from "@/utils/queries";

export type RequestProps = {
  request: GetRequest;
  approverList: GetRequestApproverList;
};

function Request({ request, approverList }) {
  return <div>Request</div>;
}

export default Request;
