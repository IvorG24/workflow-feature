import { NotificationTableRow } from "@/utils/types";
import { create } from "zustand";

type Store = {
  notificationList: NotificationTableRow[];
  unreadNotificationCount: number;
  actions: {
    setNotificationList: (notificiations: NotificationTableRow[]) => void;
    readNotification: (idList: string[]) => void;
    setUnreadNotification: (count: number) => void;
  };
};

export const useNotificationStore = create<Store>((set) => ({
  notificationList: [],
  unreadNotificationCount: 0,
  actions: {
    setNotificationList(notificiations) {
      set((state) => ({
        ...state,
        notificationList: notificiations,
      }));
    },
    readNotification(idList) {
      set((state) => {
        const newNotificationList = state.notificationList.map(
          (notification) => {
            if (!idList.includes(notification.notification_id))
              return notification;
            return {
              ...notification,
              notification_is_read: true,
            };
          }
        );
        return {
          ...state,
          notificationList: newNotificationList,
        };
      });
    },
    setUnreadNotification(count) {
      set((state) => ({
        ...state,
        unreadNotificationCount: count,
      }));
    },
  },
}));

export const useNotificationList = () =>
  useNotificationStore((state) => state.notificationList);
export const useUnreadNotificationCount = () =>
  useNotificationStore((state) => state.unreadNotificationCount);
export const useNotificationActions = () =>
  useNotificationStore((state) => state.actions);
