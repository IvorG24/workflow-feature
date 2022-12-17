// todo: close navbar when clicked outside
import SelectItem from "@/components/SelectItem/SelectItem";
import { CreateOrRetrieveUserTeamList } from "@/utils/queries";
import type { Database, FormTableRow } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Burger,
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
import { MouseEventHandler, useEffect, useState } from "react";
import {
  AddCircle,
  ArrowBack,
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
import styles from "./MobileNavbar.module.scss";

type Props = {
  teamList: CreateOrRetrieveUserTeamList;
  opened: boolean;
  onToggleOpened: MouseEventHandler<HTMLButtonElement>;
};

const Navbar = ({ teamList, opened, onToggleOpened }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [activeTeam, setActiveTeam] = useState(`${router.query.tid}`);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [forms, setForms] = useState<FormTableRow[]>([]);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  // const [isOpenReview, setIsOpenReview] = useState(false);
  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  // const { hovered: addReviewHovered, ref: addReviewRef } = useHover();

  const requestForms = forms.filter((form) => form.form_type === "request");
  // const reviewForms = forms.filter((form) => form.form_type === "review");

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
    if (router.query.tid !== undefined) {
      fetchForms();
    }
  }, [supabase, router.query.tid]);

  const teamOptions = teamList.map((team) => ({
    value: team.team_id,
    label: team.team_table.team_name as string, // todo: team_name should not be null in database
    image: "", // todo: add logo column to team table in database
  }));

  teamOptions.unshift({
    value: "create",
    label: "Create Team",
    image: "",
  });

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  return (
    <>
      <MantineNavbar px="md" pb="lg" pt="xs" aria-label="sidebar navigation">
        <MantineNavbar.Section>
          <Group position="apart">
            <Image
              src={`/image/logo-${colorScheme}.png`}
              alt="logo"
              width={147}
              height={52}
            />

            <Group mr={10}>
              <ActionIcon
                variant="default"
                onClick={() => toggleColorScheme()}
                className={styles.darkModeToggler}
              >
                {colorScheme === "dark" ? <Sun /> : <Moon />}
              </ActionIcon>
              <Burger opened={opened} onClick={onToggleOpened} />
            </Group>
          </Group>
        </MantineNavbar.Section>

        <Divider mt="xs" />

        <Select
          mt="md"
          label="Team"
          value={router.query.tid === undefined ? "create" : activeTeam}
          data={teamOptions}
          itemComponent={SelectItem}
          onChange={(val) => {
            setActiveTeam(`${val}`);
            router.push(`/t/${val}/requests`);
          }}
          icon={<Avatar src="" radius="xl" size="sm" />}
          size="md"
          styles={{
            label: {
              fontSize: "14px",
            },
          }}
        />

        {router.query.tid !== undefined ? (
          <>
            <MantineNavbar.Section mt="lg">
              <Title order={2} size={14} weight={400} color="dimmed">
                Account
              </Title>

              <Container
                fluid
                className={styles.notificationsButtonWrapper}
                p={0}
              >
                <NavLink
                  component="a"
                  label="Notifications"
                  href={`/t/${activeTeam}/notifications`}
                  mt="xs"
                  icon={
                    <IconWrapper className={iconStyle}>
                      <Notifications />
                    </IconWrapper>
                  }
                />
                {/* <Badge
                  className={styles.notificationsButtonWrapper__badge}
                  color="red"
                >
                  1
                </Badge> */}

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
                <NavLink
                  component="a"
                  href={`/t/${activeTeam}/settings/members`}
                  label="Members"
                  icon={
                    <IconWrapper className={iconStyle}>
                      <GroupIcon />
                    </IconWrapper>
                  }
                />
                <NavLink
                  component="a"
                  href={`/t/${activeTeam}/requests`}
                  label="All Requests"
                  icon={
                    <IconWrapper className={iconStyle}>
                      <EditDocument />
                    </IconWrapper>
                  }
                />
              </Container>
            </MantineNavbar.Section>

            <Divider mt="xs" />
            <ScrollArea className={styles.navScroll}>
              <MantineNavbar.Section mt="lg">
                {/* <NavLink
                  component="a"
                  href={`/t/${activeTeam}/dashboard`}
                  label="Dashboard"
                  icon={
                    <IconWrapper className={iconStyle}>
                      <Dashboard />
                    </IconWrapper>
                  }
                /> */}

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
                          router.push(`/t/${activeTeam}/requests/create`);
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
                      href={`/t/${activeTeam}/forms/${form.form_id}`}
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
                                href={`/t/${activeTeam}/form/edit/${form.form_id}`}
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
                        </Group>
                      }
                    />
                  ))}
                </NavLink>

                {/* <NavLink
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
                          router.push(`/t/${activeTeam}/review/create`);
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
                                href={`/t/${activeTeam}/form/edit/${form.form_id}`}
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
                        </Group>
                      }
                    />
                  ))}
                </NavLink> */}
              </MantineNavbar.Section>
            </ScrollArea>
            <MantineNavbar.Section className={styles.footer}>
              <NavLink
                component="a"
                href={`/profiles/${user?.id}/bio`}
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
          </>
        ) : null}
      </MantineNavbar>
    </>
  );
};

export default Navbar;
