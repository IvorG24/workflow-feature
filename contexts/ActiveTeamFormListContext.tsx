import { GetTeamFormTemplateList } from "@/utils/queries-new";
import { createContext } from "react";

const ActiveTeamFormListContext =
  createContext<GetTeamFormTemplateList>(undefined);

export default ActiveTeamFormListContext;
