import NotificationListContext from "@/contexts/NotificationListContext";
import { Badge, Box, Tabs, Title } from "@mantine/core";
import { NextPage } from "next";
import { useContext } from "react";
import NotificationItem from "./NotificationItem";

const NotificationPage: NextPage = () => {
  const { userAccount, team } = useContext(NotificationListContext);

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
      <Tabs defaultValue="userAccount" mt="md">
        <Tabs.List grow position="apart">
          <Tabs.Tab
            value="userAccount"
            rightSection={
              userAccount &&
              userAccount.length > 0 && (
                <Badge
                  sx={{ width: 16, height: 16, pointerEvents: "none" }}
                  variant="filled"
                  size="xs"
                  p={0}
                >
                  {userAccount.length}
                </Badge>
              )
            }
            p="sm"
          >
            User Account
          </Tabs.Tab>
          <Tabs.Tab
            value="team"
            rightSection={
              team &&
              team.length > 0 && (
                <Badge
                  sx={{ width: 16, height: 16, pointerEvents: "none" }}
                  variant="filled"
                  size="xs"
                  p={0}
                >
                  {team.length}
                </Badge>
              )
            }
            p="sm"
          >
            Team
          </Tabs.Tab>
          {/* // TODO: Archived. */}
          {/* <Tabs.Tab
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
          </Tabs.Tab> */}
        </Tabs.List>

        <Tabs.Panel value="userAccount" pt="xs">
          {/* // TODO: Commenting this for now. */}
          {/* <Text color="blue" align="right" maw="500px">
            Mark all as read
          </Text> */}
          {userAccount && userAccount.length === 0 && "No new notifications"}
          {userAccount &&
            userAccount.length > 0 &&
            userAccount.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel>

        <Tabs.Panel value="team" pt="xs">
          {team && team.length === 0 && "No new notifications"}
          {team &&
            team.length > 0 &&
            team.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel>

        {/* <Tabs.Panel value="reviews" pt="xs">
          {review.length === 0 && "No new notifications"}
          {review.length > 0 &&
            review.map((data) => (
              <NotificationItem key={data.notification_id} data={data} />
            ))}
        </Tabs.Panel> */}
      </Tabs>
    </Box>
  );
};

export default NotificationPage;
