// todo: create unit tests
// todo: improve mobile responsiveness and improve layout
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { MEMBERS } from "tempData";
import data from "../../teams.json";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import MembersTable from "./MembersTable";
import SearchBar from "./SearchBar";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
};

const Member = () => {
  const [searchBarValue, setSearchBarValue] = useState("");
  const members = data[0].members;

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
          <MembersTable members={members} />
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
          <InviteTeamMembersSection members={MEMBERS} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Member;
