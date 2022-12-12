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
  Flex,
  Group,
  Modal,
  Navbar as MantineNavbar,
  NavLink,
  ScrollArea,
  Select,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  AddCircle,
  ArrowBack,
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
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./MobileNavbar.module.scss";
import { requestForms, reviewForms } from "./Navbar";

const TEAMS = [
  {
    id: 1,
    image: "",
    value: "Acme Corporation",
    label: "Acme Corporation",
  },
  {
    id: 2,
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
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenReview, setIsOpenReview] = useState(false);
  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  const { hovered: addReviewHovered, ref: addReviewRef } = useHover();
  useEffect(() => {
    // TODO: Convert into a hook
    // todo: team_id
    const fetchForms = async () => {
      const { data } = await supabase.from("form_table").select("*");
      const forms = data?.map((form) => {
        return { value: `${form.form_id}`, label: `${form.form_name}` };
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
          <Title order={2} size={14} weight={400} color="dimmed">
            Account
          </Title>

          <Container fluid className={styles.notificationsButtonWrapper} p={0}>
            <NavLink
              component="button"
              label="Notifications"
              mt="xs"
              icon={
                <IconWrapper className={iconStyle}>
                  <Notifications />
                </IconWrapper>
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
              <IconWrapper className={iconStyle}>
                <Settings />
              </IconWrapper>
            }
          />
        </MantineNavbar.Section>

        <Divider mt="xs" />
        <ScrollArea className={styles.navScroll}>
          <MantineNavbar.Section mt="lg">
            <NavLink
              component="a"
              href={`/t/${selectedTeam?.id}/dashboard`}
              label="Dashboard"
              icon={
                <IconWrapper className={iconStyle}>
                  <Dashboard />
                </IconWrapper>
              }
            />
            <NavLink
              component="a"
              href={`/t/${selectedTeam?.id}/requests`}
              label="Requests"
              icon={
                <IconWrapper className={iconStyle}>
                  <EditDocument />
                </IconWrapper>
              }
            />
            <NavLink
              component="a"
              label="Request Forms"
              opened={isOpenRequest}
              onClick={() => {
                if (!addRequestHovered) {
                  setActiveNest((v) => (v === "request" ? "" : "request"));
                  setIsOpenRequest((v) => !v);
                }
              }}
              icon={
                <Flex align="center" gap={4}>
                  <IconWrapper
                    fontSize={10}
                    color="gray"
                    className={`${styles.arrowRight} ${
                      activeNest === "request" && styles.arrowDown
                    }`}
                  >
                    <ArrowBack />
                  </IconWrapper>
                  <IconWrapper className={iconStyle}>
                    <Description />
                  </IconWrapper>
                </Flex>
              }
              disableRightSectionRotation
              rightSection={
                <Group ref={addRequestRef}>
                  <ActionIcon
                    variant="subtle"
                    component="a"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/t/${selectedTeam?.id}/requests/create`);
                    }}
                    className={`${styles.createRequestButton} ${
                      colorScheme === "dark"
                        ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                        : ""
                    }`}
                  >
                    <AddCircle />
                  </ActionIcon>
                </Group>
              }
              childrenOffset={28}
            >
              {requestForms.map((form) => (
                <NavLink
                  key={form.form_id}
                  component="a"
                  href={`/t/${selectedTeam?.id}/forms/${form.form_id}`}
                  label={form.form_name}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(
                          `/t/${selectedTeam?.id}/requests/create/${form.form_id}`
                        );
                      }}
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
              ))}
            </NavLink>

            <NavLink
              label="Review Forms"
              component="a"
              childrenOffset={28}
              opened={isOpenReview}
              onClick={() => {
                if (!addReviewHovered) {
                  setActiveNest((v) => (v === "review" ? "" : "review"));
                  setIsOpenReview((v) => !v);
                }
              }}
              icon={
                <Flex align="center" gap={4}>
                  <IconWrapper
                    fontSize={10}
                    color="gray"
                    className={`${styles.arrowRight} ${
                      activeNest === "review" && styles.arrowDown
                    }`}
                  >
                    <ArrowBack />
                  </IconWrapper>
                  <IconWrapper className={iconStyle}>
                    <Description />
                  </IconWrapper>
                </Flex>
              }
              disableRightSectionRotation
              rightSection={
                <Group ref={addReviewRef}>
                  <ActionIcon
                    variant="subtle"
                    component="a"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/t/${selectedTeam?.id}/review/create`);
                    }}
                    className={`${styles.createRequestButton} ${
                      colorScheme === "dark"
                        ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                        : ""
                    }`}
                  >
                    <AddCircle />
                  </ActionIcon>
                </Group>
              }
            >
              {reviewForms.map((form) => (
                <NavLink
                  key={form.form_id}
                  component="a"
                  href={`/t/${selectedTeam?.id}/forms/${form.form_id}`}
                  label={form.form_name}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(
                          `/t/${selectedTeam?.id}/review/create/${form.form_id}`
                        );
                      }}
                      aria-label="create a review"
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
              ))}
            </NavLink>

            <NavLink
              component="a"
              // TODO: Commented out page route has no content. Kindly fix.
              href={`/t/${selectedTeam?.id}/settings/members`}
              label="Members"
              icon={
                <IconWrapper className={iconStyle}>
                  <GroupIcon />
                </IconWrapper>
              }
            />
          </MantineNavbar.Section>
        </ScrollArea>
        <MantineNavbar.Section className={styles.footer}>
          <NavLink
            component="a"
            href="/profile"
            label="Mary Joy Dumancal"
            description="View Profile"
            icon={
              <IconWrapper className={iconStyle}>
                <Avatar radius="xl" />
              </IconWrapper>
            }
          />
          <Button
            variant="light"
            color="red"
            fullWidth
            leftIcon={
              <IconWrapper className={styles.logoutButton__icon}>
                <Logout />
              </IconWrapper>
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
