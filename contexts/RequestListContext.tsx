import { RequestType } from "@/utils/types";
import { createContext } from "react";

export type RequestProps = {
  requestList: RequestType[];
  requestCount: number;
  forms: { value: string; label: string }[];
};

const RequestListContext = createContext<RequestProps | null>(null);

export default RequestListContext;
