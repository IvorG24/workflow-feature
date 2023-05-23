import {
  ActionIcon,
  Avatar,
  Box,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconExternalLink,
  IconTrash,
} from "@tabler/icons-react";

const RequestCard = () => {
  return (
    <Card maw={300}>
      <Stack>
        <Group position="apart">
          {/* requestor name and avatar */}
          <Group spacing={8}>
            <Avatar color="blue" size="sm" radius="xl" />
            <Text>John Doe</Text>
          </Group>
          {/* user actions menu */}
          <Menu shadow="md" position="left-start" width={200}>
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item color="blue" icon={<IconExternalLink size={14} />}>
                Open Request
              </Menu.Item>
              <Menu.Item
                color="green"
                icon={<IconCircleCheckFilled size={14} />}
              >
                Approve Request
              </Menu.Item>
              <Menu.Item color="red" icon={<IconCircleXFilled size={14} />}>
                Reject Request
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item icon={<IconTrash size={14} />}>
                Cancel Request
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        {/* request details */}
        <Box>
          <Text weight={600}>Form Name 1</Text>
          <Text>Form description</Text>
          <Group mt={12} spacing={8}>
            <Tooltip label="Date created">
              <IconCalendar stroke={1} />
            </Tooltip>

            <Text>May 23, 2023</Text>
          </Group>
        </Box>
        {/* request status and approvers */}
        <Group position="apart">
          <Group c="green" spacing={8}>
            <IconCircleCheckFilled />
            <Text weight={500}>Approved</Text>
          </Group>
          <Tooltip.Group openDelay={300} closeDelay={100}>
            <Avatar.Group spacing="sm">
              <Tooltip label="Salazar Troop" withArrow>
                <Avatar src="image.png" radius="xl" />
              </Tooltip>
              <Tooltip label="Bandit Crimes" withArrow>
                <Avatar src="image.png" radius="xl" />
              </Tooltip>
              <Tooltip label="Jane Rata" withArrow>
                <Avatar src="image.png" radius="xl" />
              </Tooltip>
              <Tooltip
                withArrow
                label={
                  <>
                    <div>John Outcast</div>
                    <div>Levi Capitan</div>
                  </>
                }
              >
                <Avatar radius="xl">+2</Avatar>
              </Tooltip>
            </Avatar.Group>
          </Tooltip.Group>
        </Group>
      </Stack>
    </Card>
  );
};

export default RequestCard;
