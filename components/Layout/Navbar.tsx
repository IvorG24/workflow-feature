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
  Menu,
  Navbar as MantineNavbar,
  NavLink,
  ScrollArea,
  Select,
  Text,
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
  Dots,
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

const formList = [
  {
    form_id: 1,
    form_name: "Request Form 1",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "request",
    form_priority: null,
  },
  {
    form_id: 2,
    form_name: "Request Form 2",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "request",
    form_priority: null,
  },
  {
    form_id: 3,
    form_name: "Review Form 1",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 4,
    form_name: "Review Form 2",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 5,
    form_name: "Review Form 3",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 6,
    form_name: "Review Form 4",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 7,
    form_name: "Review Form 5",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 8,
    form_name: "Review Form 6",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
  {
    form_id: 9,
    form_name: "Review Form 7",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: "16e81faa-6266-4efb-b697-0c86d28d6489",
    form_type: "review",
    form_priority: null,
  },
];

export const requestForms = formList.filter(
  (form) => form.form_type === "request"
);
export const reviewForms = formList.filter(
  (form) => form.form_type === "review"
);

type Props = {
  teamList: CreateOrRetrieveUserTeamList;
  activeTeamIndex: number;
};

const Navbar = ({ teamList, activeTeamIndex }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const activeTeam = teamList[activeTeamIndex];
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  // const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  // const [selectedForm, setSelectedForm] = useState<FormRow | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [isOpenReview, setIsOpenReview] = useState(false);
  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  const { hovered: addReviewHovered, ref: addReviewRef } = useHover();

  useEffect(() => {
    // TODO: Convert into a hook
    // todo: team_id
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
  }, [supabase]);

  const teamOptions = teamList.map((team) => ({
    value: team.team_id,
    label: team.team_table.team_name as string, // todo: team_name should not be null in database
    image: "", // todo: add logo column to team table in database
  }));

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  // const handleProceed = () => {
  //   router.push(
  //     `/t/${activeTeam.team_id}/requests/create?formId=${selectedForm}`
  //   );
  //   setIsCreatingRequest(false);
  // };

  return (
    <>
      {/* <Modal
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
      </Modal> */}
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
          value={activeTeam.team_id}
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
            href={`/t/${activeTeam.team_id}/settings/general`}
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
              href={`/t/${activeTeam.team_id}/dashboard`}
              label="Dashboard"
              icon={
                <IconWrapper className={iconStyle}>
                  <Dashboard />
                </IconWrapper>
              }
            />
            <NavLink
              component="a"
              href={`/t/${activeTeam.team_id}/requests`}
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
                      router.push(`/t/${activeTeam.team_id}/requests/build`);
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
              {forms.map((form) => (
                <NavLink
                  key={form.form_id}
                  component="a"
                  href={`/t/${activeTeam.team_id}/forms/${form.form_id}`}
                  label={<Text lineClamp={1}>{form.form_name}</Text>}
                  rightSection={
                    <Group spacing={2}>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            component="a"
                            onClick={(e) => e.preventDefault()}
                            aria-label="options menu"
                            className={`${styles.createRequestButton} ${
                              colorScheme === "dark"
                                ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                                : ""
                            }`}
                          >
                            <Dots />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <NavLink
                            label="Edit form"
                            component="a"
                            href={`/t/${activeTeam.team_id}/form/edit/${form.form_id}`}
                            icon={
                              <IconWrapper>
                                <EditDocument />
                              </IconWrapper>
                            }
                          />
                        </Menu.Dropdown>
                      </Menu>
                      <ActionIcon
                        variant="subtle"
                        component="button"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(
                            `/t/${activeTeam.team_id}/requests/create?formId=${form.form_id}`
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
                    </Group>
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
                      router.push(`/t/${activeTeam.team_id}/review/build`);
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
                  href={`/t/${activeTeam.team_id}/forms/${form.form_id}`}
                  label={<Text lineClamp={1}>{form.form_name}</Text>}
                  rightSection={
                    <Group spacing={2}>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            component="a"
                            onClick={(e) => e.preventDefault()}
                            aria-label="options menu"
                            className={`${styles.createRequestButton} ${
                              colorScheme === "dark"
                                ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                                : ""
                            }`}
                          >
                            <Dots />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <NavLink
                            label="Edit form"
                            component="a"
                            href={`/t/${activeTeam.team_id}/form/edit/${form.form_id}`}
                            icon={
                              <IconWrapper>
                                <EditDocument />
                              </IconWrapper>
                            }
                          />
                        </Menu.Dropdown>
                      </Menu>
                      <ActionIcon
                        variant="subtle"
                        component="button"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(
                            `/t/${activeTeam.team_id}/review/create/${form.form_id}`
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
                    </Group>
                  }
                />
              ))}
            </NavLink>

            <NavLink
              component="a"
              // TODO: Commented out page route has no content. Kindly fix.
              href={`/t/${activeTeam.team_id}/settings/members`}
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
