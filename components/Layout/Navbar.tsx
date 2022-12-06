// todo: add team logo property to databas
import SelectItem from "@/components/SelectItem/SelectItem";
import { Database, Team } from "@/utils/types";
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
import styles from "./Navbar.module.scss";

type Props = {
  teams: Team[];
  teamId: string;
};

const Navbar = ({ teams, teamId }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const activeTeam = teams.find((team) => team.team_id === teamId);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
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

  const teamOptions = teams.map((team) => ({
    value: team.team_id,
    label: team.team_name as string, // todo: team_name should not be null in database
    image: "", // todo: add logo column to team table in database
  }));

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
              aria-label="toggle dark mode"
            >
              {colorScheme === "dark" ? <Sun /> : <Moon />}
            </ActionIcon>
          </Group>
        </MantineNavbar.Section>

        <Divider mt="xs" />

        <Select
          mt="md"
          label="Team"
          value={activeTeam?.team_id}
          data={teamOptions}
          itemComponent={SelectItem}
          onChange={(val) => router.push(`/t/${val}/dashboard`)}
          icon={<Avatar src="" radius="xl" size="sm" />}
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
                aria-label="create a request"
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
            href={`/t/${teamId}/forms`}
            label="Forms"
            icon={
              <div className={iconStyle}>
                <Description />
              </div>
            }
          />
          <NavLink
            component="a"
            // TODO: Commented out page route has no content. Kindly fix.
            // href={`/t/${teamId}/settings/members`}
            href={`/settings/members`}
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
            label="Alberto Linao"
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
