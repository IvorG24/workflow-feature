import { GetFormTemplate, GetRequestApproverList } from "@/utils/queries-new";
import { createContext } from "react";

export type CreateRequestProps = {
  formTemplate: GetFormTemplate;
  isDraft: boolean;
  approverList: GetRequestApproverList;
};

const CreateRequestContext = createContext<CreateRequestProps | null>(null);

export default CreateRequestContext;
