import { RetrievedRequestList } from "@/utils/queries";
import { createContext } from "react";

const RequestListContext = createContext<RetrievedRequestList | null>(null);

export default RequestListContext;
