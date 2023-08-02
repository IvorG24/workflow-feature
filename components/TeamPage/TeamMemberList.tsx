import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_TEAM_MEMBER_LIST_LIMIT } from "@/utils/constant";
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
  Tooltip,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { lowerCase, startCase } from "lodash";
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
}: Props) => {
  const totalPage = Math.ceil(
    teamMemberList.length / DEFAULT_TEAM_MEMBER_LIST_LIMIT
  );

  const teamMember = useUserTeamMember();
  const authUser = teamMemberList.find(
    (member) => member.team_member_id === teamMember?.team_member_id
  ) as TeamMemberType;

  const { register, handleSubmit } = useFormContext<SearchForm>();

  const sortByRole = (members: TeamMemberType[]): TeamMemberType[] => {
    const roleOrder: Record<string, number> = {
      OWNER: 1,
      ADMIN: 2,
      MEMBER: 3,
    };

    return members.sort((a, b) => {
      const roleA = roleOrder[a.team_member_role] || Infinity;
      const roleB = roleOrder[b.team_member_role] || Infinity;

      if (roleA === roleB) {
        return a.team_member_user.user_first_name.localeCompare(
          b.team_member_user.user_first_name
        );
      }

      return roleA - roleB;
    });
  };

  const getInitial = (value: string) => {
    const parts = value.split(" ");
    if (parts.length === 1) {
      return `${value[0]}${value[1]}`;
    } else {
      return `${parts[0][0]}${parts[1][0]}`;
    }
  };

  const renderAvatar = (valueList: string[]) => {
    return valueList.slice(0, 3).map((value, index) => {
      const initial = getInitial(value);

      return (
        <Tooltip label={value} withArrow key={index}>
          <Avatar
            color={getAvatarColor(
              Number(`${initial.charCodeAt(0) + initial.charCodeAt(1)}`)
            )}
            radius="xl"
            size={30}
          >
            {initial}
          </Avatar>
        </Tooltip>
      );
    });
  };

  const renderOtherAvatars = (valueList: string[]) => {
    return (
      <Tooltip
        withArrow
        label={valueList.slice(3, valueList.length).map((value, index) => {
          return <Text key={index}>{value}</Text>;
        })}
      >
        <Avatar size={30} radius="xl">
          +{valueList.length - 3}
        </Avatar>
      </Tooltip>
    );
  };

  const start = (page - 1) * DEFAULT_TEAM_MEMBER_LIST_LIMIT;
  const rows = sortByRole(teamMemberList)
    .slice(start, start + DEFAULT_TEAM_MEMBER_LIST_LIMIT)
    .map((member) => {
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
                {startCase(user.user_last_name[0])}
              </Avatar>

              <Text>{startCase(fullname)}</Text>
            </Group>
          </td>

          <td>{startCase(lowerCase(role))}</td>

          <td>
            <Tooltip.Group openDelay={300} closeDelay={100}>
              <Avatar.Group spacing="sm">
                {member.team_member_group_list.length !== 0 ? (
                  renderAvatar(member.team_member_group_list)
                ) : (
                  <Text color="dimmed">No Group</Text>
                )}
                {member.team_member_group_list.length > 3
                  ? renderOtherAvatars(member.team_member_group_list)
                  : null}
              </Avatar.Group>
            </Tooltip.Group>
          </td>

          <td>
            <Tooltip.Group openDelay={300} closeDelay={100}>
              <Avatar.Group spacing="sm">
                {member.team_member_project_list.length !== 0 ? (
                  renderAvatar(member.team_member_project_list)
                ) : (
                  <Text color="dimmed">No Project</Text>
                )}
                {member.team_member_project_list.length > 3
                  ? renderOtherAvatars(member.team_member_project_list)
                  : null}
              </Avatar.Group>
            </Tooltip.Group>
          </td>

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
                <th>Groups</th>
                <th>Projects</th>
                <th></th>
              </tr>
            </thead>

            <tbody>{rows}</tbody>
          </Table>

          <Pagination
            value={page}
            onChange={handlePageChange}
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
