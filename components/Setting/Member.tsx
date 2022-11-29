// todo: create unit tests
import { Divider, SimpleGrid } from "@mantine/core";
import { MEMBERS } from "tempData";
import InviteTeamMembersSection from "./InviteTeamMembersSection";
import YourTeamSection from "./YourTeamSection";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
};

export type Members = Member[];

const Member = () => {
  return (
    <SimpleGrid cols={1} p={0}>
      <YourTeamSection members={MEMBERS} />
      <Divider mt={50} />
      <InviteTeamMembersSection members={MEMBERS} />
    </SimpleGrid>
  );
};

export default Member;
