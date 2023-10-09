import { ROW_PER_PAGE } from "@/utils/constant";
import { customMathCeil } from "@/utils/functions";
import { startCase } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { MemberRoleType, TeamMemberType } from "@/utils/types";
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
import { useFormContext } from "react-hook-form";
import TeamMemberMenu from "./TeamMemberMenu";
import { SearchForm } from "./TeamPage";

type Props = {
  teamMemberList: TeamMemberType[];
  isUpdatingTeamMembers: boolean;
  onSearchTeamMember: (data: SearchForm) => void;
  onRemoveFromTeam: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: MemberRoleType) => void;
  onTransferOwnership: (ownerId: string, memberId: string) => void;
  page: number;
  handlePageChange: (page: number) => void;
  teamMemberCount: number;
};
const TeamMemberList = ({
  teamMemberList,
  isUpdatingTeamMembers,
  onSearchTeamMember,
  onRemoveFromTeam,
  onUpdateMemberRole,
  onTransferOwnership,
  page,
  handlePageChange,
  teamMemberCount,
}: Props) => {
  const { register, handleSubmit } = useFormContext<SearchForm>();

  const rows = teamMemberList.map((member) => {
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
              {(user.user_first_name[0] + user.user_last_name[0]).toUpperCase()}
            </Avatar>

            <Text>{startCase(fullname)}</Text>
          </Group>
        </td>

        <td>{startCase(role.toLowerCase())}</td>

        <td>
          <TeamMemberMenu
            member={member}
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
            onChange={handlePageChange}
            total={customMathCeil(teamMemberCount / ROW_PER_PAGE)}
            size="sm"
            sx={{ alignSelf: "flex-end" }}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TeamMemberList;
