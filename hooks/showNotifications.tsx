import { Check, Close, Warning } from "@/components/Icon";
import IconWrapper from "@/components/IconWrapper/IconWrapper";
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

const notifProps: Record<NotifcationState, Partial<NotificationProps>> = {
  Success: {
    color: "green",
    title: "Success!",
    icon: (
      <IconWrapper color="#fff">
        <Check />
      </IconWrapper>
    ),
  },
  Warning: {
    color: "yellow",
    title: "Warning!",
    icon: (
      <IconWrapper color="#fff">
        <Warning />
      </IconWrapper>
    ),
  },
  Danger: {
    color: "red",
    title: "Danger!",
    icon: (
      <IconWrapper color="#fff">
        <Close />
      </IconWrapper>
    ),
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
