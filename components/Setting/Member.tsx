// todo: create unit tests
import { Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { lowerCase } from "lodash";
import { useState } from "react";
import { MEMBERS } from "tempData";
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

  const filteredMembers = MEMBERS.filter((member) =>
    lowerCase(member.name).includes(searchBarValue)
  );

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
          <MembersTable filteredMembers={filteredMembers} />
        </Grid.Col>
      </Grid>
      <Divider my={{ base: 10, lg: 20 }} />
      <Grid justify="flex-end">
        <Grid.Col md={8} lg={6}>
          <InviteTeamMembersSection members={MEMBERS} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Member;
