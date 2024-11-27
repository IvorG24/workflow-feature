import { useTeamMemberList } from "@/stores/useTeamMemberStore";
import { Box } from "@mantine/core";
import { useState } from "react";
import AddTeamAdmin from "./AddTeamAdmin";
import AdminList from "./AdminList";

export type TeamAdminType = {
  team_member_id: string;
  team_member_date_created: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string;
    user_email: string;
  };
};

export type TeamAdminChoiceType = {
  team_member_id: string;
  team_member_date_created: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string;
    user_email: string;
  };
};

type Props = {
  teamId: string;
  // teamMemberList: TeamMemberType[];
};

const AdminGroup = ({ teamId }: Props) => {
  const [adminList, setAdminList] = useState<TeamAdminType[]>([]);
  const [adminListCount, setAdminListCount] = useState(0);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const teamMemberList = useTeamMemberList();

  return (
    <Box>
      {!isAddingAdmin ? (
        <AdminList
          teamId={teamId}
          adminList={adminList}
          setAdminList={setAdminList}
          setIsAddingAdmin={setIsAddingAdmin}
          adminListCount={adminListCount}
          setAdminListCount={setAdminListCount}
          teamMemberList={teamMemberList}
        />
      ) : null}
      {isAddingAdmin ? (
        <AddTeamAdmin
          teamId={teamId}
          setIsAddingAdmin={setIsAddingAdmin}
          setAdminList={setAdminList}
          setAdminListCount={setAdminListCount}
        />
      ) : null}
    </Box>
  );
};

export default AdminGroup;
