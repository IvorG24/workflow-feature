// todo: create unit tests
// todo: improve mobile responsiveness and improve layout
import { Database } from "@/utils/database.types";
import { fetchTeamMemberList, FetchTeamMemberList } from "@/utils/queries";
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MEMBERS } from "tempData";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import MembersTable from "./MembersTable";
import SearchBar from "./SearchBar";

const Member = () => {
  const [searchBarValue, setSearchBarValue] = useState("");
  const supabaseClient = useSupabaseClient<Database>();
  const router = useRouter();
  const [memberList, setMemberList] = useState<FetchTeamMemberList>([]);

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;
      const fetchedMemberList = await fetchTeamMemberList(
        supabaseClient,
        `${router.query.tid}`
      );
      setMemberList(fetchedMemberList);
    })();
  }, [supabaseClient, router]);

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
          <MembersTable memberList={memberList} />
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
