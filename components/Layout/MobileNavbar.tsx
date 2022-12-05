// todo: close navbar when clicked outside
import SelectItem from "@/components/SelectItem/SelectItem";
import type { Database } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Modal,
  Navbar as MantineNavbar,
  NavLink,
  Select,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { MouseEvent, useEffect, useState } from "react";
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
} from "../Icon";
import styles from "./MobileNavbar.module.scss";

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
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [teamDropdownValue, setTeamDropdownValue] = useState<string | null>(
    TEAMS[0].value
  );
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // TODO: Convert into a hook
    const fetchForms = async () => {
      const { data } = await supabase.from("form_name_table").select("*");
      const forms = data?.map((form) => {
        return { value: `${form.form_name_id}`, label: `${form.form_name}` };
      });
      if (forms !== undefined && forms.length !== 0) {
        setForms(forms);
        setSelectedForm(`${forms[0].value}`);
      }
    };
    fetchForms();
  }, [supabase]);

  const selectedTeam = TEAMS.find((team) => team.value === teamDropdownValue);

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  const handleAddRequest = (e: MouseEvent) => {
    e.preventDefault();
    setIsCreatingRequest(true);
  };

  const handleProceed = () => {
    router.push(`/requests/create?formId=${selectedForm}`);
    setIsCreatingRequest(false);
  };

  return (
    <>
      <Modal
        opened={isCreatingRequest}
        onClose={() => setIsCreatingRequest(false)}
        padding="xl"
        centered
      >
        <Container>
          <Title>Choose Form Type</Title>
          <Select
            mt="xl"
            placeholder="Choose one"
            data={forms}
            value={selectedForm}
            onChange={setSelectedForm}
          />

          <Group position="right">
            <Button mt="xl" variant="subtle" onClick={handleProceed}>
              {`Got to Next Page >`}
            </Button>
          </Group>
        </Container>
      </Modal>

      <MantineNavbar
        width={{ base: "250" }}
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
                onClick={handleAddRequest}
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
    </>
  );
};

export default Navbar;
