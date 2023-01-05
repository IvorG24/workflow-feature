// todo: create unit tests
// todo: improve mobile responsiveness and improve layout
import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import { GetTeam, updateTeamMemberRole } from "@/utils/queries-new";
import { TeamMemberRole } from "@/utils/types-new";
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useState } from "react";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import MemberList from "./MemberList";
import SearchBar from "./SearchBar";

const Member = () => {
  const user = useUser();
  const router = useRouter();

  const { supabaseClient } = useSessionContext();

  const memberListContextValue = useContext(ActiveTeamContext);

  const [searchBarValue, setSearchBarValue] = useState("");
  const [memberList, setMemberList] = useState<GetTeam>(
    memberListContextValue as GetTeam
  );
  const [authUserRole, setAuthUserRole] = useState<string>("");
  const rolesOrder = ["owner", "admin", "purchaser", "member"];

  // sort A-Z and Owner > Admin > Member
  const sortedMemberList = useMemo(
    () => sortMemberList(memberList),
    [memberList]
  );

  const filterMemberList =
    sortedMemberList &&
    sortedMemberList.filter((member) => {
      const memberName = `${member.username}`;
      if (memberName) {
        return lowerCase(memberName).includes(searchBarValue);
      }
    });

  const handleUpdateMemberRole = async (
    memberId: string,
    memberRole: TeamMemberRole,
    newRole: TeamMemberRole
  ) => {
    const authUserRoleIndex = rolesOrder.indexOf(authUserRole);
    const newRoleIndex = rolesOrder.indexOf(newRole);

    if (authUserRoleIndex > newRoleIndex) {
      return showNotification({
        title: "Error!",
        message: `You don't have enough permission to perform this action.`,
        color: "red",
      });
    }

    if (newRole === memberRole) {
      return showNotification({
        title: "Update invalid.",
        message: `User can't be reassigned to the same role.`,
        color: "orange",
      });
    }

    try {
      await updateTeamMemberRole(
        supabaseClient,
        `${router.query.tid}`,
        memberId,
        newRole
      );

      showNotification({
        title: "Success!",
        message: `Member role updated.`,
        color: "green",
      });
      const updatedMemberList =
        memberList &&
        memberList.map((member) => {
          if (member.user_id === memberId) {
            return {
              ...member,
              team_member_member_role_id: newRole,
              member_role_id: newRole,
            };
          } else return member;
        });
      // dispatchMemberList({
      //   type: MemberListActionEnum.SET,
      //   payload: {
      //     memberList: updatedMemberList,
      //   },
      // });
      router.replace(router.asPath);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setMemberList(memberListContextValue as GetTeam);
  }, [memberListContextValue]);

  useEffect(() => {
    if (user) {
      const userRole =
        memberList &&
        memberList.find((member) => member.user_id === user.id)?.member_role_id;

      userRole !== undefined && setAuthUserRole(userRole as string);
    }
  }, [user, memberList]);

  return (
    <Stack>
      <Grid justify="space-between">
        <Grid.Col md={4}>
          <Title order={3}>Your Team Members</Title>
          <Text>Manage your existing team and change roles/permissions</Text>
        </Grid.Col>
        <Grid.Col md={8} lg={6}>
          <SearchBar
            setSearchBarValue={setSearchBarValue}
            value={searchBarValue}
            numberOfMembers={memberList?.length || 0}
          />
          <MemberList
            authUserRole={authUserRole}
            authUser={user}
            memberList={filterMemberList}
            updateMemberRole={handleUpdateMemberRole}
          />
        </Grid.Col>
      </Grid>
      <Divider my={{ base: 10, lg: 20 }} />
      <Grid justify="space-between">
        <Grid.Col md={4}>
          <Title order={3}>Invite Team Members</Title>
          <Text>
            Admins can edit your profile, invite team members and manage all
            jobs. Recruiters can only manage their own jobs
          </Text>
        </Grid.Col>
        <Grid.Col md={8} lg={6}>
          {/* use members from membersList */}
          <InviteTeamMembersSection members={[]} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

const sortMemberList = (members: GetTeam) => {
  members &&
    members.sort((a, b) => {
      const nameA = `${a.username}`;
      const nameB = `${b.username}`;
      if (nameA !== null && nameB !== null) {
        return nameA < nameB ? -1 : 1;
      }
      return 0;
    });

  // todo: update member roles to match team_role
  const rolesOrder = ["owner", "admin", "purchaser", "member"];

  members &&
    members.sort((a, b) => {
      const indexA = rolesOrder.indexOf(a.member_role_id as string);
      const indexB = rolesOrder.indexOf(b.member_role_id as string);
      return indexA - indexB;
    });
  return members;
};

export default Member;
