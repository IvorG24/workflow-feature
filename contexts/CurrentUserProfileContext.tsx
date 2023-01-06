import { CreateOrRetrieveUserProfile } from "@/utils/queries-new";
import { createContext } from "react";

const CurrentUserProfileContext =
  createContext<CreateOrRetrieveUserProfile>(undefined);

export default CurrentUserProfileContext;
