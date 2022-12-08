// todo: create unit tests
// todo: improve mobile responsiveness and improve layout
import supabase from "@/utils/supabase";
import { TeamRoleEnum, UserProfile } from "@/utils/types";
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSessionContext, useUser } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import MembersTable from "./MembersTable";
import SearchBar from "./SearchBar";

export type TeamMember = {
  team_id: string;
  lock_account: boolean;
  team_role: TeamRoleEnum;
  user_profile_table: UserProfile;
};

const Member = () => {
  const router = useRouter();
  const user = useUser();
  const { tid } = router.query;
  const { supabaseClient } = useSessionContext();
  const [searchBarValue, setSearchBarValue] = useState("");
  const [memberList, setMemberList] = useState<TeamMember[]>([]);
  const [authUserRole, setAuthUserRole] = useState<string>("");
  const rolesOrder = ["owner", "admin", "member"];
  // sort A-Z and Owner > Admin > Member
  const sortedMemberList = useMemo(
    () => sortMemberList(memberList),
    [memberList]
  );

  const handleUpdateMemberRole = async (
    memberId: string,
    memberRole: TeamRoleEnum,
    newRole: TeamRoleEnum
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
      const { error } = await supabase
        .from("team_role_table")
        .update({ team_role: newRole })
        .eq("user_id", memberId);

      if (error) throw error;

      showNotification({
        title: "Success!",
        message: `Member role updated.`,
        color: "green",
      });
      fetchTeamMembers();
    } catch (error) {
      console.log(error);
    }
  };

  const filterMemberList = sortedMemberList.filter((member) => {
    const memberName = member.user_profile_table.full_name;
    if (memberName) {
      return lowerCase(memberName).includes(searchBarValue);
    }
  });

  const fetchTeamMembers = useCallback(async () => {
    try {
      const { data: team_role_table, error } = await supabaseClient
        .from("team_role_table")
        .select(`team_id, team_role, lock_account, user_profile_table(*)`)
        .eq("team_id", tid);

      if (error) throw error;

      setMemberList(team_role_table as TeamMember[]);
    } catch (error) {
      console.error(error);
    }
  }, [tid, supabaseClient]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  useEffect(() => {
    if (user) {
      const userRole = memberList.find(
        (member) => member.user_profile_table.user_id === user.id
      )?.team_role;

      userRole !== undefined && setAuthUserRole(userRole);
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
            numberOfMembers={memberList.length}
          />
          <MembersTable
            authUserRole={authUserRole}
            authUser={user}
            members={filterMemberList}
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

const sortMemberList = (members: TeamMember[]) => {
  members.sort((a, b) => {
    const nameA = a.user_profile_table.full_name;
    const nameB = b.user_profile_table.full_name;
    if (nameA !== null && nameB !== null) {
      return nameA < nameB ? -1 : 1;
    }
    return 0;
  });

  // todo: update member roles to match team_role
  const rolesOrder = ["owner", "admin", "manager", "member"];

  members.sort((a, b) => {
    const indexA = rolesOrder.indexOf(a.team_role);
    const indexB = rolesOrder.indexOf(b.team_role);
    return indexA - indexB;
  });
  return members;
};

export default Member;
