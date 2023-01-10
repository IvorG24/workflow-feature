import { NotificationPageProps } from "pages/t/[tid]/notifications";
import { createContext } from "react";

const NotificationListContext = createContext<NotificationPageProps>({
  userAccount: [],
  team: [],
});

export default NotificationListContext;
