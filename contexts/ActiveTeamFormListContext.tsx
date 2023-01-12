import { GetTeamFormTemplateList } from "@/utils/queries-new";
import { createContext } from "react";

export type ActiveTeamFormList = {
  formTemplateList: GetTeamFormTemplateList;
  setFormTemplateList: (formTemplateList: GetTeamFormTemplateList) => void;
};

const ActiveTeamFormListContext = createContext<ActiveTeamFormList>({
  formTemplateList: [],
  setFormTemplateList: () => {},
});
export default ActiveTeamFormListContext;
