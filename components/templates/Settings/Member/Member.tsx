import { Divider } from "@mantine/core";
import InviteTeamMembersSection from "./InviteTeamMembersSection/InviteTeamMembersSection";
import styles from "./Member.module.scss";
import YourTeamSection from "./YourTeamSection/YourTeamSection";

const members = [
  {
    id: "1",
    name: "Lance",
    email: "lance@gmail.com",
    role: "admin",
    image: "",
  },
  {
    id: "2",
    name: "Choy",
    email: "choy@gmail.com",
    role: "admin",
    image: "",
  },
  {
    id: "3",
    name: "Ren",
    email: "ren@gmail.com",
    role: "admin",
    image: "",
  },
  {
    id: "4",
    name: "Jayson",
    email: "jayson@gmail.com",
    role: "member",
    image: "",
  },
  {
    id: "5",
    name: "JC",
    email: "jc@gmail.com",
    role: "member",
    image: "",
  },
  {
    id: "6",
    name: "Mark",
    email: "mark@gmail.com",
    role: "member",
    image: "",
  },
];

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
    <div className={styles.container}>
      <div className={styles.content}>
        <YourTeamSection members={members} />
      </div>
      <Divider mt={50} />
      <div className={styles.content}>
        <InviteTeamMembersSection members={members} />
      </div>
    </div>
  );
};

export default Member;
