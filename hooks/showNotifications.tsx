import { Check, Close, Warning } from "@/components/Icon";
import {
  NotificationProps,
  showNotification as notification,
} from "@mantine/notifications";
import { ReactElement, ReactNode } from "react";

type NotifcationState = "Success" | "Warning" | "Danger";
type NotificationParams = {
  title?: ReactNode;
  message: ReactNode;
  state: NotifcationState;
  icon?: ReactElement;
};

const WHITE_COLOR = "#fff";

const notifProps: Record<NotifcationState, Partial<NotificationProps>> = {
  Success: {
    color: "green",
    title: "Success!",
    icon: <Check color={WHITE_COLOR} />,
  },
  Warning: {
    color: "yellow",
    title: "Warning!",
    icon: <Warning color={WHITE_COLOR} />,
  },
  Danger: {
    color: "red",
    title: "Danger!",
    icon: <Close color={WHITE_COLOR} />,
  },
};

const showNotification = (args: NotificationParams) => {
  const { state, message, title, icon } = args;
  return notification({
    title,
    message,
    icon,
    autoClose: 3000,
    ...notifProps[state],
  });
};

export default showNotification;
