// todo: create unit tests
import { MEMBERS } from "tempData";
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
  return <YourTeamSection members={MEMBERS} />;
};

export default Member;
