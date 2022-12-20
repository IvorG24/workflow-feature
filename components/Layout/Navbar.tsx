// todo: add team logo property to databas
import SelectItem from "@/components/SelectItem/SelectItem";
import { useUserProfileContext } from "@/contexts/UserProfileContext";
import {
  CreateOrRetrieveUserTeamList,
  retrieveTeamOwnerAndAdmins,
} from "@/utils/queries";
import { Database, FormTableRow } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  AddCircle,
  ArrowBack,
  Description,
  EditDocument,
  Group as GroupIcon,
  Logout,
  Notifications,
  Settings,
} from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./Navbar.module.scss";

type Props = {
  teamList: CreateOrRetrieveUserTeamList;
  openNavbar: boolean;
};

const Navbar = ({ teamList, openNavbar }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [activeTeam, setActiveTeam] = useState(`${router.query.tid}`);
  const { colorScheme } = useMantineColorScheme();
  const [forms, setForms] = useState<FormTableRow[]>([]);
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);

  // const [isOpenReview, setIsOpenReview] = useState(false);
  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  // const { hovered: addReviewHovered, ref: addReviewRef } = useHover();

  const requestForms = forms.filter((form) => form.form_type === "request");
  // const reviewForms = forms.filter((form) => form.form_type === "review");

  const {
    state: { userProfile },
  } = useUserProfileContext();

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
        setActiveTeam(`${router.query.tid}`);
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
    label: `${team.team_table.team_name}`,
    image: team.team_table.team_logo,
  }));

  teamOptions.unshift({
    value: "create",
    label: "Create Team",
    image: "",
  });

  const iconStyle = `${styles.icon} ${
    colorScheme === "dark" ? styles.colorLight : ""
  }`;

  const handlePushToCreateRequest = async (formId: number) => {
    try {
      const ownerAndAdminList = await retrieveTeamOwnerAndAdmins(
        supabase,
        `${router.query.tid}`,
        `${user?.id}`
      );

      if (ownerAndAdminList.length > 0) {
        router.push(`/t/${activeTeam}/requests/create?formId=${formId}`);
      } else {
        showNotification({
          title: "Warning!",
          message:
            "This team doesn't have any possible approvers yet. Assign an admin first before creating a request",
          color: "orange",
        });
      }
    } catch (e) {
      console.log(e);
      showNotification({
        title: "Error!",
        message: "Failed to fetch approvers",
        color: "red",
      });
    }
  };

  return (
    <MantineNavbar
      p="md"
      h={{ sm: "auto" }}
      width={{ sm: 200, lg: 300 }}
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
    >
      <Select
        label="Team"
        value={router.query.tid === undefined ? "create" : activeTeam}
        data={teamOptions}
        itemComponent={SelectItem}
        onChange={(val) => {
          setActiveTeam(`${val}`);
          if (val === "create") {
            router.push(`/teams/create`);
          } else {
            router.push(`/t/${val}/requests`);
          }
        }}
        icon={<Avatar src={activeTeam} radius="xl" size="sm" />}
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
              {/* <NavLink
                  component="a"
                  href={`/t/${activeTeam}/dashboard`}
                  label="Dashboard"
                  mt="xs"
                  icon={
                    <IconWrapper className={iconStyle}>
                      <Dashboard />
                    </IconWrapper>
                  }
                /> */}

              <NavLink
                component="a"
                href={`/t/${activeTeam}/notifications`}
                label="Notifications"
                icon={
                  <IconWrapper className={iconStyle}>
                    <Notifications />
                  </IconWrapper>
                }
              />
              {/* // TODO: Commenting this for now. */}
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
                href={`/t/${activeTeam}/requests?active_tab=all&page=1`}
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
              <NavLink
                component="a"
                label="Forms"
                opened={isOpenRequest}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/t/${activeTeam}/forms`);
                }}
                icon={
                  <Flex align="center" gap={4}>
                    <IconWrapper
                      fontSize={10}
                      color="gray"
                      className={`${styles.arrowRight} ${
                        activeNest === "request" && styles.arrowDown
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!addRequestHovered) {
                          setActiveNest((v) =>
                            v === "request" ? "" : "request"
                          );
                          setIsOpenRequest((v) => !v);
                        }
                      }}
                    >
                      <ArrowBack />
                    </IconWrapper>
                    <IconWrapper className={iconStyle}>
                      <Description />
                    </IconWrapper>
                  </Flex>
                }
                px="xs"
                disableRightSectionRotation
                rightSection={
                  <Group ref={addRequestRef}>
                    <ActionIcon
                      variant="subtle"
                      component="a"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/t/${activeTeam}/forms/build`);
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
                    px="xs"
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
                          handlePushToCreateRequest(form.form_id);
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

              {/* <NavLink
                  label="Review Forms"
                  component="a"
                  childrenOffset={15}
                  opened={isOpenReview}
                  px="xs"
                  icon={
                    <Flex align="center" gap={4}>
                      <IconWrapper
                        fontSize={10}
                        color="gray"
                        className={`${styles.arrowRight} ${
                          activeNest === "review" && styles.arrowDown
                        }`}
                        onClick={() => {
                          if (!addReviewHovered) {
                            setActiveNest((v) =>
                              v === "review" ? "" : "review"
                            );
                            setIsOpenReview((v) => !v);
                          }
                        }}
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
                      px="xs"
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
                </NavLink> */}
            </MantineNavbar.Section>
          </ScrollArea>
          <MantineNavbar.Section mt="auto">
            <NavLink
              component="a"
              href={`/t/${router.query.tid}/profiles/${user?.id}/bio`}
              label={userProfile?.full_name}
              description="View Profile"
              icon={
                <IconWrapper className={iconStyle}>
                  <Avatar radius="xl" src={userProfile?.avatar_url} />
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
        </>
      ) : null}
    </MantineNavbar>
  );
};

export default Navbar;
