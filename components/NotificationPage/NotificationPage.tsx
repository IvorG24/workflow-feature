import { AppType, NotificationTableRow } from "@/utils/types";
import { Container, Title } from "@mantine/core";

type Props = {
  app: AppType;
  teamMemberId: string;
  notificationList: NotificationTableRow[];
  unreadNotificationCount: number;
};

const NotificationPage = ({
  app,
  notificationList,
  unreadNotificationCount,
  teamMemberId,
}: Props) => {
  console.log(notificationList);
  console.log(unreadNotificationCount);
  console.log(teamMemberId);
  return (
    <Container>
      <Title>{app} Notification Page</Title>
    </Container>
  );
};

export default NotificationPage;
