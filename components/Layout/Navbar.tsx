// todo: add team logo property to databas
import SelectItem from "@/components/SelectItem/SelectItem";
import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import CurrentUserTeamListContext from "@/contexts/CurrentUserTeamListContext";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import { getTeamApproverList } from "@/utils/queries-new";
import { Database } from "@/utils/types";
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
import { useContext, useState } from "react";
import {
  AddCircle,
  ArrowBack,
  Dashboard,
  Description,
  EditDocument,
  Group as GroupIcon,
  Logout,
  Notifications,
} from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./Navbar.module.scss";

type Props = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: Props) => {
  const teamList = useContext(CurrentUserTeamListContext) || [];
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const { colorScheme } = useMantineColorScheme();
  const [activeNest, setActiveNest] = useState<string | null>(null);
  const [isOpenRequest, setIsOpenRequest] = useState(false);

  const { hovered: addRequestHovered, ref: addRequestRef } = useHover();
  const userProfile = useContext(CurrentUserProfileContext);
  const formList = useContext(ActiveTeamFormListContext);
  const fileUrlListContext = useContext(FileUrlListContext);

  const teamOptions = teamList.map((team) => ({
    value: team.team_id as string,
    label: team.team_name as string,
    image: fileUrlListContext?.teamLogoUrlList[team.team_id as string],
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
      const teamApproverList = await getTeamApproverList(
        supabase,
        `${router.query.tid}`
      );

      if (teamApproverList && teamApproverList.length > 0) {
        router.push(
          `/t/${router.query.tid as string}/requests/create?formId=${formId}`
        );
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
        value={(router.query.tid as string) || "create"}
        data={teamOptions}
        itemComponent={SelectItem}
        onChange={(val) => {
          if (val === "create") {
            router.push(`/teams/create`);
          } else {
            router.push(`/t/${val}/dashboard`);
          }
        }}
        icon={
          <Avatar
            src={
              fileUrlListContext?.teamLogoUrlList[router.query.tid as string]
            }
            radius="xl"
            size="sm"
          />
        }
        size="md"
        styles={{
          label: {
            fontSize: "14px",
          },
        }}
        data-cy="navbar-select-teams"
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
                onClick={() =>
                  router.push(`/t/${router.query.tid as string}/dashboard`)
                }
                label="Dashboard"
                mt="xs"
                icon={
                  <IconWrapper className={iconStyle}>
                    <Dashboard />
                  </IconWrapper>
                }
              />

              <NavLink
                component="a"
                label="Notifications"
                icon={
                  <IconWrapper className={iconStyle}>
                    <Notifications />
                  </IconWrapper>
                }
                onClick={() =>
                  router.push(`/t/${router.query.tid as string}/notifications`)
                }
              />
              {/* // TODO: Commenting this for now. */}
              {/* <Badge
              className={styles.notificationsButtonWrapper__badge}
              color="red"
            >
              1
            </Badge> */}

              {/* <NavLink
                component="a"
                // href={`/t/${router.query.tid as string}/settings/general`}
                label="Settings"
                icon={
                  <IconWrapper className={iconStyle}>
                    <Settings />
                  </IconWrapper>
                }
                onClick={() => router.push(`/t/${router.query.tid as string}/settings/general`)}
              /> */}
              <NavLink
                component="a"
                label="Members"
                icon={
                  <IconWrapper className={iconStyle}>
                    <GroupIcon />
                  </IconWrapper>
                }
                onClick={() =>
                  router.push(
                    `/t/${router.query.tid as string}/settings/members`
                  )
                }
              />
              <NavLink
                component="a"
                label="All Requests"
                icon={
                  <IconWrapper className={iconStyle}>
                    <EditDocument />
                  </IconWrapper>
                }
                onClick={() =>
                  router.push(
                    `/t/${
                      router.query.tid as string
                    }/requests?active_tab=all&page=1`
                  )
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
                  router.push(`/t/${router.query.tid as string}/forms`);
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
                      data-cy="navbar-forms-dropdown"
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
                        router.push(
                          `/t/${router.query.tid as string}/forms/build`
                        );
                      }}
                      className={`${styles.createRequestButton} ${
                        colorScheme === "dark"
                          ? `${styles.colorLight} ${styles.createRequestButton__darkMode}`
                          : ""
                      }`}
                      data-cy="navbar-createForm"
                    >
                      <AddCircle />
                    </ActionIcon>
                  </Group>
                }
                childrenOffset={15}
              >
                {formList &&
                  formList.map((form) => (
                    <NavLink
                      px="xs"
                      key={form.form_id}
                      component="a"
                      // href={`/t/${router.query.tid as string}/requests?active_tab=all&page=1&form=${form.form_id}`}
                      onClick={() =>
                        router.push(
                          `/t/${
                            router.query.tid as string
                          }/requests?active_tab=all&page=1&form=${form.form_id}`
                        )
                      }
                      label={form.form_name}
                      rightSection={
                        <ActionIcon
                          variant="subtle"
                          component="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePushToCreateRequest(form.form_id as number);
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
                          router.push(`/t/${router.query.tid as string}/review/build`);
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
                      href={`/t/${router.query.tid as string}/forms/${form.form_id}`}
                      label={form.form_name}
                      rightSection={
                        <ActionIcon
                          variant="subtle"
                          component="button"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(
                              `/t/${router.query.tid as string}/review/create/${form.form_id}`
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
              // href={`/t/${router.query.tid}/profiles/${user?.id}/bio`}
              onClick={() =>
                router.push(`/t/${router.query.tid}/profiles/${user?.id}/bio`)
              }
              label={userProfile?.user_first_name}
              description="View Profile"
              icon={
                <IconWrapper className={iconStyle}>
                  <Avatar
                    radius="xl"
                    src={
                      fileUrlListContext?.avatarUrlList[
                        userProfile?.user_id as string
                      ]
                    }
                  />
                </IconWrapper>
              }
              data-cy="navbar-profiles"
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
              data-cy="navbar-logout"
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
