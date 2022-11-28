import SelectItem from "@/components/SelectItem/SelectItem";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Navbar as MantineNavbar,
  NavLink,
  Select,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import {
  AddCircle,
  Dashboard,
  Description,
  EditDocument,
  Group as GroupIcon,
  Logout,
  Moon,
  Notifications,
  Settings,
  Sun,
} from "../../Icon";
import styles from "./Navbar.module.scss";

const TEAMS = [
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
  const [teamDropdownValue, setTeamDropdownValue] = useState<string | null>(
    TEAMS[0].value
  );

  const selectedTeam = TEAMS.find((team) => team.value === teamDropdownValue);

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  return (
    <MantineNavbar
      width={{ base: "250" }}
      style={{ maxWidth: "250px" }}
      className={styles.container}
      px="md"
      py="lg"
      aria-label="sidebar navigation"
    >
      <MantineNavbar.Section>
        <Group position="apart">
          <Image
            src={`/image/logo-${colorScheme}.png`}
            alt="logo"
            width={147}
            height={52}
          />
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            className={styles.darkModeToggler}
          >
            {colorScheme === "dark" ? <Sun /> : <Moon />}
          </ActionIcon>
        </Group>
      </MantineNavbar.Section>

      <Divider mt="xs" />

      <Select
        mt="md"
        label="Team"
        value={teamDropdownValue}
        data={TEAMS}
        itemComponent={SelectItem}
        onChange={(val) => setTeamDropdownValue(val)}
        icon={<Avatar src={selectedTeam?.image} radius="xl" size="sm" />}
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
            <div className={iconStyle}>
              <Dashboard />
            </div>
          }
        />
        <NavLink
          component="a"
          href="/requests"
          label="Requests"
          className={iconStyle}
          icon={<EditDocument />}
          rightSection={
            <ActionIcon
              variant="subtle"
              component="button"
              onClick={(e) => e.preventDefault()}
              className={`${styles.createRequestButton} ${
                colorScheme === "dark"
                  ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                  : ""
              }`}
            >
              <AddCircle />
            </ActionIcon>
          }
        />
        <NavLink
          component="a"
          href="/forms"
          label="Forms"
          icon={
            <div className={iconStyle}>
              <Description />
            </div>
          }
        />
        <NavLink
          component="a"
          href="/settings/members"
          label="Members"
          icon={
            <div className={iconStyle}>
              <GroupIcon />
            </div>
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
              <div className={iconStyle}>
                <Notifications />
              </div>
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
          href="/settings/general"
          label="Settings"
          icon={
            <div className={iconStyle}>
              <Settings />
            </div>
          }
        />
      </MantineNavbar.Section>

      <MantineNavbar.Section className={styles.footer}>
        <NavLink
          component="a"
          href="/profile"
          label="Mary Joy Dumancal"
          description="View Profile"
          icon={
            <div className={iconStyle}>
              <Avatar radius="xl" />
            </div>
          }
        />
        <Button
          variant="light"
          color="red"
          fullWidth
          leftIcon={
            <div className={styles.logoutButton__icon}>
              <Logout />
            </div>
          }
        >
          Logout
        </Button>
      </MantineNavbar.Section>
    </MantineNavbar>
  );
};

export default Navbar;
