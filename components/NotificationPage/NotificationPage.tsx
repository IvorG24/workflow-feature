import useFetchNotificationList from "@/hooks/useFetchNotificationList";
import { Badge, Box, Tabs, Title } from "@mantine/core";
import { useRouter } from "next/router";
import NotificationItem from "./NotificationItem";

const NotificationPage = () => {
  const router = useRouter();
  // ? Where will invitation notif be displayed? In General?
  const { userNotificationList: general } = useFetchNotificationList();
  // * Commenting out tid so general will include all user notifications regardless of team.
  // router.query.tid as string
  const { userNotificationList: request } = useFetchNotificationList(
    router.query.tid as string,
    "request"
  );
  const { userNotificationList: review } = useFetchNotificationList(
    router.query.tid as string,
    "review"
  );

  return (
    <Box
      p="md"
      sx={{
        boxShadow: "8px 10px 9px 0px rgba(0,0,0,0.1)",
        border: "1px solid #E9E9E9",
        borderRadius: "8px",
      }}
      maw="500px"
      mih="700px"
    >
      <Title order={3}>Notifications</Title>
      <Tabs defaultValue="general" mt="md">
        <Tabs.List grow position="apart">
          <Tabs.Tab
            value="general"
            rightSection={
              review.length > 0 && (
                <Badge
                  sx={{ width: 16, height: 16, pointerEvents: "none" }}
                  variant="filled"
                  size="xs"
                  p={0}
                >
                  {general.length}
                </Badge>
              )
            }
            p="sm"
          >
            General
          </Tabs.Tab>
          <Tabs.Tab
            value="requests"
            rightSection={
              review.length > 0 && (
                <Badge
                  sx={{ width: 16, height: 16, pointerEvents: "none" }}
                  variant="filled"
                  size="xs"
                  p={0}
                >
                  {request.length}
                </Badge>
              )
            }
            p="sm"
          >
            Requests
          </Tabs.Tab>
          <Tabs.Tab
            value="reviews"
            rightSection={
              review.length > 0 && (
                <Badge
                  sx={{ width: 16, height: 16, pointerEvents: "none" }}
                  variant="filled"
                  size="xs"
                  p={0}
                >
                  {review.length}
                </Badge>
              )
            }
            p="sm"
          >
            Reviews
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xs">
          {/* // TODO: Commenting this for now. */}
          {/* <Text color="blue" align="right" maw="500px">
            Mark all as read
          </Text> */}
          {general.length === 0 && "No new notifications"}
          {general.length > 0 &&
            general.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel>

        <Tabs.Panel value="requests" pt="xs">
          {request.length === 0 && "No new notifications"}
          {request.length > 0 &&
            request.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          {review.length === 0 && "No new notifications"}
          {review.length > 0 &&
            review.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default NotificationPage;
