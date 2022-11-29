// import { errorToast, successToast, warningToast } from "@utils";
import { Box, Divider, Flex, Text, Title } from "@mantine/core";
import { lowerCase } from "lodash";
import { useState } from "react";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import { Member } from "./Member";
import MembersTable from "./MembersTable";
import SearchBar from "./SearchBar";

type Props = {
  members: Member[];
};

const YourTeamSection = ({ members }: Props) => {
  const [searchBarValue, setSearchBarValue] = useState("");

  const filteredMembers = members.filter((member) =>
    lowerCase(member.name).includes(searchBarValue)
  );

  return (
    <Flex gap="sm" direction={{ base: "column", md: "row" }}>
      <Box w={{ base: "100%", lg: "50%" }}>
        <Title order={3}>Your Team Members</Title>
        <Text>Manage your existing team and change roles/permissions</Text>
      </Box>
      <Box w="100%" ml={{ lg: "10rem" }}>
        <SearchBar
          onChange={(e) => setSearchBarValue(e.target.value)}
          onClear={() => setSearchBarValue("")}
          value={searchBarValue}
          numberOfMembers={members.length}
        />
        <MembersTable filteredMembers={filteredMembers} />
        <Divider my={{ base: 10, lg: 50 }} />
        <InviteTeamMembersSection members={members} />
      </Box>
    </Flex>
  );
};

export default YourTeamSection;
