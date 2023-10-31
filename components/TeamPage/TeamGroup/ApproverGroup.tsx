import { TeamMemberType } from "@/utils/types";
import { Box } from "@mantine/core";
import { useState } from "react";
import AddTeamApprover from "./AddTeamApprover";
import ApproverList from "./ApproverList";

export type TeamApproverType = {
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

export type TeamApproverChoiceType = {
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
  teamMemberList: TeamMemberType[];
};

const ApproverGroup = ({ teamId, teamMemberList }: Props) => {
  const [approverList, setApproverList] = useState<TeamApproverType[]>([]);
  const [approverListCount, setApproverListCount] = useState(0);
  const [isAddingApprover, setIsAddingApprover] = useState(false);

  return (
    <Box>
      {!isAddingApprover ? (
        <ApproverList
          teamId={teamId}
          approverList={approverList}
          setApproverList={setApproverList}
          setIsAddingApprover={setIsAddingApprover}
          approverListCount={approverListCount}
          setApproverListCount={setApproverListCount}
          teamMemberList={teamMemberList}
        />
      ) : null}
      {isAddingApprover ? (
        <AddTeamApprover
          teamId={teamId}
          setIsAddingApprover={setIsAddingApprover}
          setApproverList={setApproverList}
          setApproverListCount={setApproverListCount}
        />
      ) : null}
    </Box>
  );
};

export default ApproverGroup;
