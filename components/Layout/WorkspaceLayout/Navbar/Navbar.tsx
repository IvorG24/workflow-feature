import { useState } from "react";
import {
  Navbar as MantineNavbar,
  Select,
  Avatar,
  NavLink,
  Badge,
  Container,
  ActionIcon,
  useMantineColorScheme,
  Divider,
  Group,
  Title,
  Button,
} from "@mantine/core";
import SelectItem from "components/SelectItem/SelectItem";
import Image from "next/image";
import styles from "./Navbar.module.scss";

const WORKSPACES = [
  {
    image: "",
    value: "Acme Corporation",
    label: "Acme Corporation",
  },
  {
    image: "",
    value: "Wonka Industries",
    label: "Wonka Industries",
  },
];

const Navbar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [workspaceDropdownValue, setWorkspaceDropdownValue] = useState<
    string | null
  >(WORKSPACES[0].value);

  const selectedWorkspace = WORKSPACES.find(
    (workspace) => workspace.value === workspaceDropdownValue
  );
  return (
    <MantineNavbar
      width={{ base: 300 }}
      px="md"
      py="lg"
      aria-label="sidebar navigation"
    >
      <MantineNavbar.Section>
        <Group position="apart">
          <Image
            src={`/images/logo-${
              colorScheme === "dark" ? "light" : "dark"
            }.png`}
            alt="logo"
            width={150}
            height={48}
          />
          <ActionIcon variant="default" onClick={() => toggleColorScheme()}>
            <Image
              src={
                colorScheme === "dark"
                  ? "/icons/moon-dark.png"
                  : "/icons/sun-light.png"
              }
              alt="toggle dark mode"
              width={20}
              height={20}
            />
          </ActionIcon>
        </Group>
      </MantineNavbar.Section>

      <Divider mt="xs" />

      <Select
        mt="md"
        label="Workspace"
        value={workspaceDropdownValue}
        data={WORKSPACES}
        itemComponent={SelectItem}
        onChange={(val) => setWorkspaceDropdownValue(val)}
        icon={<Avatar src={selectedWorkspace?.image} radius="xl" size="sm" />}
        size="md"
        styles={{
          label: {
            fontSize: "14px",
          },
        }}
      />

      <MantineNavbar.Section mt="lg">
        <NavLink
          component="a"
          href="/dashboard"
          label="Dashboard"
          icon={
            <Image
              src={`/icons/dashboard-${colorScheme}.png`}
              width={24}
              height={24}
              alt="dashboard"
            />
          }
        />
        <NavLink
          component="a"
          href="/requests"
          label="Requests"
          icon={
            <Image
              src={`/icons/edit-document-${colorScheme}.png`}
              width={24}
              height={24}
              alt="requests"
            />
          }
          rightSection={
            <ActionIcon
              variant="subtle"
              component="button"
              onClick={(e) => e.preventDefault()}
              className={styles.createRequestButton}
            >
              <Image
                src={
                  colorScheme === "dark"
                    ? "/icons/add-circle-dark.png"
                    : "/icons/add-circle-light.png"
                }
                alt="create a request"
                width={20}
                height={20}
              />
            </ActionIcon>
          }
        />
        <NavLink
          component="a"
          href="/forms"
          label="Forms"
          icon={
            <Image
              src={`/icons/description-${colorScheme}.png`}
              width={24}
              height={24}
              alt="forms"
            />
          }
        />
        <NavLink
          component="a"
          href="/team"
          label="Team"
          icon={
            <Image
              src={`/icons/group-${colorScheme}.png`}
              width={24}
              height={24}
              alt="team"
            />
          }
        />
      </MantineNavbar.Section>

      <Divider mt="xs" />

      <MantineNavbar.Section mt="lg">
        <Title order={2} size={14} weight={400} color="dimmed">
          Account
        </Title>

        <Container fluid className={styles.notificationsButtonWrapper} p={0}>
          <NavLink
            component="button"
            label="Notifications"
            mt="xs"
            icon={
              <Image
                src={`/icons/notifications-${colorScheme}.png`}
                width={24}
                height={24}
                alt="notifications"
              />
            }
          />
          <Badge
            className={styles.notificationsButtonWrapper__badge}
            color="red"
          >
            1
          </Badge>
        </Container>

        <NavLink
          component="a"
          href="/settings"
          label="Settings"
          icon={
            <Image
              src={`/icons/settings-${colorScheme}.png`}
              width={24}
              height={24}
              alt="settings"
            />
          }
        />
      </MantineNavbar.Section>

      <MantineNavbar.Section className={styles.footer}>
        <NavLink
          component="a"
          href="/profile"
          label="Mary Joy Dumancal"
          description="View Profile"
          icon={<Avatar radius="xl" />}
        />
        <Button
          variant="light"
          color="red"
          fullWidth
          leftIcon={
            <Image
              src={`/icons/logout-red.png`}
              width={20}
              height={20}
              alt="logout"
            />
          }
        >
          Logout
        </Button>
      </MantineNavbar.Section>
    </MantineNavbar>
  );
};

export default Navbar;
