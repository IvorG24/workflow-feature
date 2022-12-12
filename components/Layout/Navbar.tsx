// todo: add team logo property to databas
import SelectItem from "@/components/SelectItem/SelectItem";
import { CreateOrRetrieveUserTeamList } from "@/utils/queries";
import { Database, FormRow } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Navbar as MantineNavbar,
  NavLink,
  ScrollArea,
  Select,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
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
import styles from "./Navbar.module.scss";

type Props = {
  teamList: CreateOrRetrieveUserTeamList;
};

const Navbar = ({ teamList }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [activeTeam, setActiveTeam] = useState(`${router.query.tid}`);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [forms, setForms] = useState<FormRow[]>([]);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenReview, setIsOpenReview] = useState(false);
  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  const { hovered: addReviewHovered, ref: addReviewRef } = useHover();

  const requestForms = forms.filter((form) => form.form_type === "request");
  const reviewForms = forms.filter((form) => form.form_type === "review");

  useEffect(() => {
    // TODO: Convert into a hook
    const fetchForms = async () => {
      try {
        const { data, error } = await supabase
          .from("form_table")
          .select("*")
          .eq("team_id", router.query.tid);
        if (error) throw error;

        setForms(data);
        // setSelectedForm(data[0]);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Forms",
          color: "red",
        });
      }
    };
    fetchForms();
  }, [supabase, router.query.tid]);

  const teamOptions = teamList.map((team) => ({
    value: team.team_id,
    label: team.team_table.team_name as string, // todo: team_name should not be null in database
    image: "", // todo: add logo column to team table in database
  }));

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  return (
    <>
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
          value={activeTeam}
          data={teamOptions}
          itemComponent={SelectItem}
          onChange={(val) => {
            setActiveTeam(`${val}`);
            router.push(`/t/${val}/dashboard`);
          }}
          icon={<Avatar src="" radius="xl" size="sm" />}
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
              component="a"
              href={`/t/${activeTeam}/notifications`}
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
            href={`/t/${activeTeam}/settings/general`}
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
              href={`/t/${activeTeam}/dashboard`}
              label="Dashboard"
              icon={
                <IconWrapper className={iconStyle}>
                  <Dashboard />
                </IconWrapper>
              }
            />
            <NavLink
              component="a"
              href={`/t/${activeTeam}/requests`}
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
                      router.push(`/t/${activeTeam}/requests/build`);
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
              childrenOffset={15}
            >
              {requestForms.map((form) => (
                <NavLink
                  key={form.form_id}
                  component="a"
                  href={`/t/${activeTeam}/requests?formId=${form.form_id}`}
                  label={form.form_name}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(
                          `/t/${activeTeam}/requests/create?formId=${form.form_id}`
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
              childrenOffset={15}
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
                      router.push(`/t/${activeTeam}/review/build`);
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
                  href={`/t/${activeTeam}/forms/${form.form_id}`}
                  label={form.form_name}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(
                          `/t/${activeTeam}/review/create/${form.form_id}`
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
              href={`/t/${activeTeam}/settings/members`}
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
            href={`/profiles/${user?.id}/bio`}
            label="Alberto Linao"
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
            onClick={async () => {
              await supabase.auth.signOut();
              await router.push("/sign-in");
            }}
          >
            Logout
          </Button>
        </MantineNavbar.Section>
      </MantineNavbar>
    </>
  );
};

export default Navbar;
