import {
  getAllTeamMembersWithoutGroupMembers,
  getTeamGroupMemberList,
} from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamGroupTableRow } from "@/utils/types";
import {
  Box,
  CloseButton,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  Paper,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import AddTeamMember from "./AddTeamMember";
import MemberList from "./MemberList";

export type TeamMemberType = {
  team_group_member_id: string;
  team_member: {
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
};

export type TeamMemberChoiceType = {
  team_member_id: string;
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
  selectedGroup: TeamGroupTableRow;
  setSelectedGroup: Dispatch<SetStateAction<TeamGroupTableRow | null>>;
  isFetchingMembers: boolean;
  setIsFetchingMembers: Dispatch<SetStateAction<boolean>>;
};

const GroupMembers = ({
  teamId,
  selectedGroup,
  setSelectedGroup,
  isFetchingMembers,
  setIsFetchingMembers,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [groupMemberList, setGroupMemberList] = useState<TeamMemberType[]>([]);
  const [groupMemberListCount, setGroupMemberListCount] = useState(0);

  const [checkList, setCheckList] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState("");

  const [groupMemberChoiceList, setGroupMemberChoiceList] = useState<
    { label: string; value: string; member: TeamMemberChoiceType }[]
  >([]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const { data: teamMemberList, count: teamMemberListCount } =
          await getTeamGroupMemberList(supabaseClient, {
            groupId: selectedGroup.team_group_id,
            page: 1,
            limit: ROW_PER_PAGE,
          });

        setGroupMemberList(teamMemberList as unknown as TeamMemberType[]);
        setGroupMemberListCount(teamMemberListCount ? teamMemberListCount : 0);
        setIsFetchingMembers(false);
        setCheckList([]);
        setActivePage(1);
        setSearch("");
        setIsAddingMember(false);
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    };
    if (selectedGroup) {
      fetchGroupMembers();
    }
  }, [selectedGroup]);

  useEffect(() => {
    const fetchTeamMemeberChoiceList = async () => {
      setIsFetchingMembers(true);
      const choices = await getAllTeamMembersWithoutGroupMembers(
        supabaseClient,
        { teamId: teamId, groupId: selectedGroup.team_group_id }
      );
      const teamMemberChoices = choices as unknown as TeamMemberChoiceType[];
      const formattedChoices = teamMemberChoices.map((member) => {
        return {
          label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
          value: member.team_member_id,
          member: member,
        };
      });
      setGroupMemberChoiceList(formattedChoices);
      setIsFetchingMembers(false);
    };
    if (isAddingMember) {
      fetchTeamMemeberChoiceList();
    }
  }, [isAddingMember]);

  return (
    <Container p={0} fluid pos="relative">
      <LoadingOverlay
        visible={isFetchingMembers}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Flex align="center" justify="space-between">
        <Title order={2}>{`${selectedGroup.team_group_name}`}</Title>
        <CloseButton onClick={() => setSelectedGroup(null)} />
      </Flex>
      <Divider mb="xl" mt="sm" />

      <Box mt="xl">
        <Paper p="xl" shadow="xs">
          {!isAddingMember ? (
            <MemberList
              groupMemberList={groupMemberList}
              setGroupMemberList={setGroupMemberList}
              groupMemberListCount={groupMemberListCount}
              setGroupMemberListCount={setGroupMemberListCount}
              setIsAddingMember={setIsAddingMember}
              checkList={checkList}
              setCheckList={setCheckList}
              activePage={activePage}
              setActivePage={setActivePage}
              search={search}
              setSearch={setSearch}
              selectedGroup={selectedGroup}
            />
          ) : null}
          {isAddingMember ? (
            <AddTeamMember
              setIsAddingMember={setIsAddingMember}
              setGroupMemberList={setGroupMemberList}
              setGroupMemberListCount={setGroupMemberListCount}
              groupMemberChoiceList={groupMemberChoiceList}
              selectedGroup={selectedGroup}
            />
          ) : null}
        </Paper>
      </Box>
    </Container>
  );
};

export default GroupMembers;
