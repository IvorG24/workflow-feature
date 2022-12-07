// todo: create unit tests
// todo: improve mobile responsiveness and improve layout
import { UserProfile } from "@/utils/types";
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MEMBERS } from "tempData";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import MembersTable from "./MembersTable";
import SearchBar from "./SearchBar";

export type TeamMember = {
  team_id: string;
  lock_account: boolean;
  team_role: string;
  user_profile_table: UserProfile;
};

const Member = () => {
  const [searchBarValue, setSearchBarValue] = useState("");
  const { supabaseClient } = useSessionContext();
  const router = useRouter();
  const [memberList, setMemberList] = useState<TeamMember[]>([]);
  const { tid } = router.query;

  // todo: refactor useEffects into a join
  useEffect(() => {
    (async () => {
      try {
        const { data: team_role_table, error } = await supabaseClient
          .from("team_role_table")
          .select(`team_id, team_role, lock_account, user_profile_table(*)`)
          .eq("team_id", tid);

        if (error) throw error;

        // sort roles from Manager > Member
        // todo: change sort conditions if roles are Owner > Admin > Member
        const sorted_team_role_table = team_role_table.sort((a, b) =>
          a.team_role.localeCompare(b.team_role)
        );

        setMemberList(sorted_team_role_table as TeamMember[]);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [supabaseClient, tid]);

  return (
    <Stack>
      <Grid justify="space-between">
        <Grid.Col md={4}>
          <Title order={3}>Your Team Members</Title>
          <Text>Manage your existing team and change roles/permissions</Text>
        </Grid.Col>
        <Grid.Col md={8} lg={6}>
          <SearchBar
            onChange={(e) => setSearchBarValue(e.target.value)}
            onClear={() => setSearchBarValue("")}
            value={searchBarValue}
            numberOfMembers={MEMBERS.length}
          />
          <MembersTable members={memberList} />
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

export default Member;
