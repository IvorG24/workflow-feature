import { Badge, Box, Tabs, Text, Title } from "@mantine/core";
import NotificationItem from "./NotificationItem";

// fetched data from database should be sorted by most recent
const tempData = [
  {
    id: 1,
    team_id: 1,
    message: "Sed vel enim sit amet nunc viverra dapibus.",
    created_at: "12/2/2022",
  },
  {
    id: 2,
    team_id: 2,
    message: "Duis mattis egestas metus.",
    created_at: "8/18/2022",
  },
  {
    id: 3,
    team_id: 3,
    message:
      "Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat.",
    created_at: "7/18/2022",
  },
  {
    id: 4,
    team_id: 4,
    message:
      "Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci.",
    created_at: "7/2/2022",
  },
  {
    id: 5,
    team_id: 5,
    message:
      "Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.",
    created_at: "6/4/2022",
  },
  {
    id: 6,
    team_id: 6,
    message:
      "Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.",
    created_at: "10/16/2022",
  },
  {
    id: 7,
    team_id: 7,
    message: "Aenean sit amet justo. Morbi ut odio.",
    created_at: "11/25/2022",
  },
];

const NotificationPage = () => {
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
              <Badge
                sx={{ width: 16, height: 16, pointerEvents: "none" }}
                variant="filled"
                size="xs"
                p={0}
              >
                {tempData.length}
              </Badge>
            }
            p="sm"
          >
            General
          </Tabs.Tab>
          <Tabs.Tab value="reviews" p="sm">
            Reviews
          </Tabs.Tab>
          <Tabs.Tab value="requests" p="sm">
            Requests
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xs">
          <Text color="blue" align="right" maw="500px">
            Mark all as read
          </Text>
          {tempData.map((data) => (
            <NotificationItem key={data.id} data={data} />
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          Reviews notifications
        </Tabs.Panel>

        <Tabs.Panel value="requests" pt="xs">
          Requests notifications
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default NotificationPage;
