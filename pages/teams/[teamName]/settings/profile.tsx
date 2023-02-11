import Layout from "@/components/Layout/Layout";
import {
  createNotification,
  getTeam,
  GetTeam,
  getTeamMember,
  getTeamMemberList,
  inviteUserToTeam,
  removeTeamMember,
  transferTeamOwnership,
  updateTeamMemberRole,
} from "@/utils/queries";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  createStyles,
  Grid,
  Group,
  Menu,
  MultiSelect,
  SelectItem,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconArrowsLeftRight,
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { startCase } from "lodash";
import { DataTable } from "mantine-datatable";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";

const PAGE_SIZE = 15;

const useStyles = createStyles((theme) => ({
  blueishRow: { color: theme.colors.blue[6] },
}));

export type Member = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type TeamSettingsProfilePageProps = {
  memberList: Member[];
  currentUserTeamInfo: Member;
  user: User;
  team: GetTeam;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const teamName = `${ctx.query?.teamName}`;

  const data = await getTeamMemberList(supabaseClient, teamName);

  //format to match TeamSettingsProfilePageProps
  const memberList = data.map((member) => {
    return {
      id: member.user_id,
      username: member.username,
      firstName: member.user_first_name,
      lastName: member.user_last_name,
      email: member.user_email,
      role: member.member_role_id,
    };
  });

  // sort by role
  // owner, admin, member
  memberList.sort((a, b) => {
    if (a.role === "owner") {
      return -1;
    } else if (a.role === "admin" && b.role === "member") {
      return -1;
    } else if (a.role === "member" && b.role === "admin") {
      return 1;
    } else if (a.role === "member" && b.role === "owner") {
      return 1;
    } else {
      return 0;
    }
  });

  // get current user's information as a team member
  const teamMember = await getTeamMember(
    supabaseClient,
    teamName,
    session?.user?.id
  );

  if (!teamMember) {
    return {
      notFound: true,
    };
  }

  // format to match TeamSettingsProfilePageProps
  const currentUserTeamInfo = {
    id: teamMember.user_id,
    username: teamMember.username,
    firstName: teamMember.user_first_name,
    lastName: teamMember.user_last_name,
    email: teamMember.user_email,
    role: teamMember.member_role_id,
  };

  const user = session?.user;

  const team = await getTeam(supabaseClient, teamName);

  return {
    props: {
      memberList,
      currentUserTeamInfo,
      user,
      team,
    },
  };
};

const TeamSettingsProfilePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ memberList, currentUserTeamInfo, user, team }) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState(memberList.slice(0, PAGE_SIZE));
  const [totalRecords, setTotalRecords] = useState(memberList.length);

  const [query, setQuery] = useState("");
  const [adminsOnly, setAdminsOnly] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<SelectItem[]>([]);

  // const [data, setData] = useState([
  //   { value: "react", label: "React" },
  //   { value: "ng", label: "Angular" },
  // ]);

  const isAdmin =
    currentUserTeamInfo?.role === "owner" ||
    currentUserTeamInfo?.role === "admin";
  const isMember = !isAdmin;
  const isOwner = currentUserTeamInfo?.role === "owner";

  const [isLoading, setIsLoading] = useState(false);

  const teamName = team?.team_name as string;
  const teamId = team?.team_id as string;

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(memberList.slice(from, to));
  }, [page]);

  const handleRefetchMemberList = async () => {
    try {
      setIsLoading(true);

      const filter = {
        isAdminOnly: adminsOnly,
        keyword: query,
      };

      const data = await getTeamMemberList(supabaseClient, teamName, filter);

      // format to match TeamSettingsProfilePageProps
      const memberList = data.map((member) => {
        return {
          id: member.user_id,
          username: member.username,
          firstName: member.user_first_name,
          lastName: member.user_last_name,
          email: member.user_email,
          role: member.member_role_id,
        };
      });

      // sort by role
      // owner, admin, member
      memberList.sort((a, b) => {
        if (a.role === "owner") {
          return -1;
        } else if (a.role === "admin" && b.role === "member") {
          return -1;
        } else if (a.role === "member" && b.role === "admin") {
          return 1;
        } else if (a.role === "member" && b.role === "owner") {
          return 1;
        } else {
          return 0;
        }
      });

      setPage(1);
      setRecords(memberList.slice(0, PAGE_SIZE));
      setTotalRecords(memberList.length);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeamMemberRole = async (
    userId: string,
    teamMemberRoleId: string
  ) => {
    try {
      setIsLoading(true);

      if (!isAdmin) {
        showNotification({
          message: "You are not an admin of this team",
          color: "red",
        });

        return;
      }

      await updateTeamMemberRole(
        supabaseClient,
        userId,
        teamId,
        teamMemberRoleId
      );
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveTeamMemberFromTeam = async (userId: string) => {
    try {
      setIsLoading(true);

      if (!isAdmin) {
        showNotification({
          message: "You are not an admin of this team",
          color: "red",
        });

        return;
      }

      await removeTeamMember(supabaseClient, userId, teamId);

      await handleRefetchMemberList();
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleTransferTeamOwnership = async (
    fromUserId: string,
    toUserId: string
  ) => {
    try {
      setIsLoading(true);

      if (!isOwner) {
        showNotification({
          message: "You are not the owner of this team",
          color: "red",
        });

        return;
      }

      await transferTeamOwnership(supabaseClient, fromUserId, toUserId, teamId);

      await handleRefetchMemberList();
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    // filter users that do not have an account
    const promises = selectedUsers.map(async (user) => {
      const trimmedEmail = user.value.trim();
      return supabaseClient
        .rpc("check_email_exists", { user_email: trimmedEmail })
        .select()
        .single();
    });

    const results = (await Promise.all(promises)) as { data: boolean }[];

    // only get users that have account
    const users = results
      .filter((result) => result.data)
      .map((result) => result.data);

    const isExistingUserEmailList = selectedUsers
      .filter((_, index) => !!users[index])
      .map((user) => user.value);

    // inviteUserToTeam
    const invitePromises = isExistingUserEmailList.map(async (email) => {
      return inviteUserToTeam(supabaseClient, user.id, email, teamId);
    });

    const invitationResultList = (await Promise.all(invitePromises)).map(
      (result) => {
        return {
          fromUserId: result.team_invitation_table.team_invitation_created_by,
          toUserEmail: result.invitation_table.invitation_target_email,
          teamInvitationId: result.team_invitation_table.team_invitation_id,
        };
      }
    );

    const toUserIdList = (
      await Promise.all(
        invitationResultList.map(({ toUserEmail }) => {
          return supabaseClient
            .from("user_profile_table")
            .select("user_id")
            .eq("user_email", toUserEmail)
            .single();
        })
      )
    ).map((result) => result?.data?.user_id);

    // createNotification
    const notificationPromises = isExistingUserEmailList.map(
      async (_, index) => {
        const teamInvitationId = `${invitationResultList[index].teamInvitationId}`;
        const content = `You have been invited to join team ${teamName}`;
        const redirectionUrl = `/teams/${teamName}/team-invitations/${teamInvitationId}`;
        const toUserId = toUserIdList[index];

        return createNotification(
          supabaseClient,
          content,
          redirectionUrl,
          toUserId,
          teamId,
          "team_invitation"
        );
      }
    );

    await Promise.all(notificationPromises);

    if (
      isExistingUserEmailList.length !== 0 &&
      isExistingUserEmailList.length === selectedUsers.length
    ) {
      showNotification({
        message: "All users invited.",
        color: "blue",
      });
    } else if (isExistingUserEmailList.length > 0) {
      showNotification({
        message:
          "Invitation sent. Only users who already have account were invited.",
        color: "yellow",
      });
    } else {
      showNotification({
        message: "No user invited. Users must registered to Formsly.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    handleRefetchMemberList();
  }, [adminsOnly]);

  return (
    <>
      {/* <LoadingOverlay visible={isLoading} overlayBlur={2} /> */}
      <Grid align="center">
        <Grid.Col xs={8} sm={9}>
          <Group noWrap>
            <TextInput
              sx={{ width: "100%" }}
              placeholder="Search member..."
              // icon={<IconSearch size={16} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <ActionIcon
              // size="md"
              onClick={() => handleRefetchMemberList()}
            >
              <IconSearch size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Grid.Col>
        <Grid.Col xs={4} sm={3}>
          <Checkbox
            label="Admins only"
            checked={adminsOnly}
            onChange={(e) => {
              setAdminsOnly(e.currentTarget.checked);
            }}
          />
        </Grid.Col>
      </Grid>

      <Group noWrap mt="md">
        <MultiSelect
          sx={{ width: "100%" }}
          maxSelectedValues={5}
          limit={5}
          value={selectedUsers.map((user) => user.value)}
          onChange={(values) => {
            const newSelectedUsers = values.map((value) => {
              const trimmedValue = value.trim();
              return { value: trimmedValue, label: trimmedValue };
            });
            setSelectedUsers(newSelectedUsers);
          }}
          data={selectedUsers}
          placeholder="Invite existing Formsly users to your team. Max 5 invites at a time."
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            // check if user is already par of team
            const isAlreadyMember = records.find(
              (record) => record.email === query
            );

            if (isAlreadyMember) {
              showNotification({
                message:
                  "Cannot invite user. User is already a member of this team",
                color: "red",
              });
              return;
            }

            if (selectedUsers.length >= 5) {
              showNotification({
                message: "You can only invite up to 5 Formsly users at a time",
                color: "red",
              });
              return;
            }
            const item = { value: query, label: query };
            setSelectedUsers((current) => [...current, item]);
            return item;
          }}
        />
        <Button size="xs" onClick={() => handleSendInvitation()}>
          Send invitation
        </Button>
      </Group>
      {/* <Box h={500} mt="md"> */}
      <Box mt="md">
        <DataTable
          minHeight={250}
          fw="bolder"
          c="dimmed"
          fetching={isLoading}
          rowClassName={({ id }) =>
            user.id === id ? classes.blueishRow : undefined
          }
          records={records}
          columns={[
            { accessor: "username" },
            {
              accessor: "name",
              render: ({ firstName, lastName }) => `${firstName} ${lastName}`,
            },
            { accessor: "email" },
            {
              accessor: "role",

              render: ({ role }) => `${startCase(role as string)}`,
            },
            {
              accessor: "actions",
              title: <Text mr="xs">Actions</Text>,
              // textAlignment: "right",
              render: ({ id, role }) => {
                const isCurrentUserInfo = user.id === id;
                const isRowOwner = role === "owner";

                return (
                  <Menu
                    shadow="md"
                    position="left-end"
                    disabled={isMember || isCurrentUserInfo || isRowOwner}
                  >
                    <Menu.Target>
                      <Group spacing={4} noWrap>
                        <ActionIcon
                          color="blue"
                          disabled={isMember || isCurrentUserInfo || isRowOwner}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Group>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>Team Role</Menu.Label>
                      {role === "admin" && (
                        <Menu.Item
                          onClick={() =>
                            handleUpdateTeamMemberRole(id as string, "member")
                          }
                        >
                          Make member
                        </Menu.Item>
                      )}
                      {role === "member" && (
                        <Menu.Item
                          onClick={() =>
                            handleUpdateTeamMemberRole(id as string, "admin")
                          }
                        >
                          Make admin
                        </Menu.Item>
                      )}

                      {isAdmin && (
                        <>
                          <Menu.Divider />
                          <Menu.Label>Danger zone</Menu.Label>
                        </>
                      )}
                      {isOwner && (
                        <Menu.Item
                          icon={<IconArrowsLeftRight size={14} />}
                          onClick={() =>
                            handleTransferTeamOwnership(
                              user.id as string,
                              id as string
                            )
                          }
                        >
                          Transfer team ownership
                        </Menu.Item>
                      )}
                      {isAdmin && (
                        <Menu.Item
                          color="red"
                          icon={<IconTrash size={14} />}
                          onClick={() =>
                            handleRemoveTeamMemberFromTeam(id as string)
                          }
                        >
                          Remove from team
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                );
              },
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
        />
      </Box>
    </>
  );
};

export default TeamSettingsProfilePage;

TeamSettingsProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
