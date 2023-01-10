import { GetFormTemplate, GetRequest, GetTeam, GetUserProfile } from "@/utils/queries-new";
import { createContext } from "react";

export type CreateRequestProps = {
  formTemplate: GetFormTemplate;
  purchaserList: { label: string; value: string }[];
  approverList: { label: string; value: string }[];
  currentUserProfile: GetUserProfile;
};

const CreateRequestContext = createContext<CreateRequestProps | null>(null);

export default CreateRequestContext;
