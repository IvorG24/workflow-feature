import { Divider } from "@mantine/core";
import { MEMBERS } from "../../../../tempData";
import InviteTeamMembersSection from "./InviteTeamMembersSection/InviteTeamMembersSection";
import YourTeamSection from "./YourTeamSection/YourTeamSection";

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
    <div>
      <div>
        <YourTeamSection members={MEMBERS} />
      </div>
      <Divider mt={50} />
      <div>
        <InviteTeamMembersSection members={MEMBERS} />
      </div>
    </div>
  );
};

export default Member;
