import { AppType } from "@/utils/types";
import { Container, Title } from "@mantine/core";

type Props = {
  app: AppType;
};

const NotificationPage = ({ app }: Props) => {
  return (
    <Container>
      <Title>{app} Notification Page</Title>
    </Container>
  );
};

export default NotificationPage;
