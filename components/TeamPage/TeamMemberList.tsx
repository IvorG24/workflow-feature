import { useUserStore } from "@/stores/useUserStore";
import { DEFAULT_TEAM_MEMBER_LIST_LIMIT } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { MemberRoleType, TeamWithTeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { lowerCase, startCase } from "lodash";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import TeamMemberMenu from "./TeamMemberMenu";
import { SearchTeamMemberForm } from "./TeamPage";

type Props = {
  team: TeamWithTeamMemberType;
  isUpdatingTeamMembers: boolean;
  onSearchTeamMember: (data: SearchTeamMemberForm) => void;
  onRemoveFromTeam: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: MemberRoleType) => void;
  onTransferOwnership: (ownerId: string, memberId: string) => void;
};

const TeamMemberList = ({
  team,
  isUpdatingTeamMembers,
  onSearchTeamMember,
  onRemoveFromTeam,
  onUpdateMemberRole,
  onTransferOwnership,
}: Props) => {
  const [page, setPage] = useState(1);
  const totalPage = Math.ceil(
    team.team_member.length / DEFAULT_TEAM_MEMBER_LIST_LIMIT
  );

  const { userProfile } = useUserStore();
  const authUser = team.team_member?.find(
    (member) => member.team_member_user.user_id === userProfile?.user_id
  ) as TeamWithTeamMemberType["team_member"][0];

  const { register, handleSubmit } = useFormContext<SearchTeamMemberForm>();

  const rows = team.team_member.map((member) => {
    const { team_member_role: role, team_member_user: user } = member;
    const fullname = `${user.user_first_name} ${user.user_last_name}`;
    return (
      <tr key={user.user_id}>
        <td>
          <Group>
            <Avatar
              color={getAvatarColor(Number(`${user?.user_id.charCodeAt(0)}`))}
              src={user.user_avatar}
              alt="Member avatar"
              size={24}
              radius={12}
            >
              {startCase(user.user_first_name[0])}
              {startCase(user.user_first_name[1])}
            </Avatar>

            <Text>{startCase(fullname)}</Text>
          </Group>
        </td>

        <td>{startCase(lowerCase(role))}</td>

        <td>
          <TeamMemberMenu
            member={member}
            authUser={authUser}
            onUpdateMemberRole={onUpdateMemberRole}
            onRemoveFromTeam={onRemoveFromTeam}
            onTransferOwnership={onTransferOwnership}
          />
        </td>
      </tr>
    );
  });

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isUpdatingTeamMembers}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Paper p="lg" shadow="xs">
        <Stack spacing={12}>
          <Text weight={600}>Member Management</Text>

          <Divider mt={-12} />

          <form onSubmit={handleSubmit(onSearchTeamMember)}>
            <TextInput
              placeholder="Search member"
              rightSection={
                <ActionIcon size="xs" type="submit">
                  <IconSearch />
                </ActionIcon>
              }
              maw={350}
              mt="xs"
              {...register("keyword")}
            />
          </form>

          <Table fontSize={14} verticalSpacing={7} highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>

            <tbody>{rows}</tbody>
          </Table>

          <Pagination
            value={page}
            onChange={setPage}
            total={totalPage}
            size="sm"
            sx={{ alignSelf: "flex-end" }}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TeamMemberList;
