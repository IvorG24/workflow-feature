import { Avatar, Select, Text, Title } from "@mantine/core";
import { Member } from "../../Member";
import styles from "./MembersTable.module.scss";

type Props = {
  filteredMembers: Member[];
};

const MembersTable = ({ filteredMembers }: Props) => {
  return (
    <div className={styles.tableWrapper}>
      {filteredMembers.map(({ name, id, email, role, image }) => {
        return (
          <div
            key={id}
            className={styles.desktopOnlyRow}
            data-testid="membersRow"
          >
            <div className={styles.userInfoContainer}>
              <Avatar src={image} alt="user profile" size={30} />
              <div>
                <Title order={5}>{name ? name : "---"}</Title>
                <Text>{email}</Text>
              </div>
            </div>

            <div className={styles.roleContainer}>
              <Select
                placeholder="Role"
                data={[
                  { value: "member", label: "Member" },
                  { value: "manager", label: "Manager" },
                  { value: "admin", label: "Admin" },
                  { value: "owner", label: "Owner" },
                ]}
                value={role}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MembersTable;
