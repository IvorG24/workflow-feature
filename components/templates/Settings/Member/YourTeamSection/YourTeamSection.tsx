// import { errorToast, successToast, warningToast } from "@utils";
import { Text, Title } from "@mantine/core";
import { lowerCase } from "lodash";
import { useState } from "react";
import { Member } from "../Member";
import MembersTable from "./MembersTable/MembersTable";
import SearchBar from "./SearchBar/SearchBar";
import styles from "./YourTeamSection.module.scss";

type Props = {
  members: Member[];
};

const YourTeamSection = ({ members }: Props) => {
  const [searchBarValue, setSearchBarValue] = useState("");

  const filteredMembers = members.filter((member) =>
    lowerCase(member.name).includes(searchBarValue)
  );

  return (
    <section className={styles.flex}>
      <div className={styles.details}>
        <Title order={3}>Your Team Members</Title>
        <Text>Manage your existing team and change roles/permissions</Text>
      </div>
      <div className={styles.members}>
        <div className={styles.members__content}>
          <SearchBar
            onChange={(e) => setSearchBarValue(e.target.value)}
            onClear={() => setSearchBarValue("")}
            value={searchBarValue}
            numberOfMembers={members.length}
          />
          <MembersTable filteredMembers={filteredMembers} />
        </div>
      </div>
    </section>
  );
};

export default YourTeamSection;
