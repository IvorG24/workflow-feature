import { DEFAULT_TEAM_GROUP_LIST_LIMIT } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Button,
  Center,
  Divider,
  Flex,
  Menu,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconDotsVertical,
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { capitalize } from "lodash";
import { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import { SearchForm } from "./TeamPage";

type Props = {
  isOwnerOrAdmin: boolean;
  teamGroupList: Record<string, TeamMemberType[]>;
  onSearchTeamGroup: (data: SearchForm) => void;
  page: number;
  handlePageChange: (page: number) => void;
  setIsCreatingTeamGroup: Dispatch<SetStateAction<boolean>>;
  setEditGroupData: Dispatch<
    SetStateAction<
      | {
          groupName: string;
          groupMembers: string[];
        }
      | undefined
    >
  >;
  handleDeleteGroup: (group: string) => void;
};

const TeamGroupList = ({
  isOwnerOrAdmin,
  teamGroupList,
  onSearchTeamGroup,
  page,
  handlePageChange,
  setIsCreatingTeamGroup,
  setEditGroupData,
  handleDeleteGroup,
}: Props) => {
  const totalPage = Math.ceil(
    Object.keys(teamGroupList).length / DEFAULT_TEAM_GROUP_LIST_LIMIT
  );
  const totalGroups = Object.keys(teamGroupList).length;

  const { register, handleSubmit } = useFormContext<SearchForm>();

  const renderAvatar = (group: string) => {
    return teamGroupList[group].slice(0, 3).map((member) => {
      const fullName = `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`;
      return (
        <Tooltip label={fullName} withArrow key={member.team_member_id}>
          <Avatar
            src={member.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${member.team_member_user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
            size={30}
          >
            {capitalize(member.team_member_user.user_first_name[0])}
            {capitalize(member.team_member_user.user_last_name[0])}
          </Avatar>
        </Tooltip>
      );
    });
  };

  const renderOtherMembers = (group: string) => {
    return (
      <Tooltip
        withArrow
        label={teamGroupList[group]
          .slice(3, teamGroupList[group].length)
          .map((member) => {
            const fullName = `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`;
            return <Text key={member.team_member_id}>{fullName}</Text>;
          })}
      >
        <Avatar size={30} radius="xl">
          +{teamGroupList[group].length - 3}
        </Avatar>
      </Tooltip>
    );
  };

  const openDeleteModal = (group: string) =>
    modals.openConfirmModal({
      title: "Delete group",
      centered: true,
      children: (
        <Text size="sm">Are you sure you want to delete this group?</Text>
      ),
      labels: { confirm: "Delete group", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDeleteGroup(group),
    });

  return (
    <Stack spacing={12}>
      <Flex align="center" justify="space-between">
        <Text weight={600}>Group Management</Text>
        {isOwnerOrAdmin ? (
          <Button
            compact
            onClick={() => {
              setEditGroupData(undefined);
              setIsCreatingTeamGroup(true);
            }}
          >
            Add Group
          </Button>
        ) : null}
      </Flex>

      <Divider />

      <form onSubmit={handleSubmit(onSearchTeamGroup)}>
        <TextInput
          placeholder="Search group"
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

      {totalGroups !== 0 ? (
        <>
          <Table fontSize={14} verticalSpacing={7} highlightOnHover>
            <thead>
              <tr>
                <th>Group</th>
                <th>Members</th>
                {isOwnerOrAdmin && <th></th>}
              </tr>
            </thead>

            <tbody>
              {Object.keys(teamGroupList).map((group) => {
                return (
                  <tr key={group}>
                    <td>{group}</td>
                    <td>
                      <Tooltip.Group openDelay={300} closeDelay={100}>
                        <Avatar.Group spacing="sm">
                          {teamGroupList[group].length !== 0 ? (
                            renderAvatar(group)
                          ) : (
                            <Tooltip withArrow label="No member/s">
                              <Avatar radius="xl" size={30} />
                            </Tooltip>
                          )}
                          {teamGroupList[group].length > 3
                            ? renderOtherMembers(group)
                            : null}
                        </Avatar.Group>
                      </Tooltip.Group>
                    </td>
                    {isOwnerOrAdmin && (
                      <td>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon>
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              icon={<IconEdit size={14} />}
                              onClick={() => {
                                setIsCreatingTeamGroup(true);
                                setEditGroupData({
                                  groupName: group,
                                  groupMembers: [
                                    ...teamGroupList[group].map(
                                      (member) => member.team_member_id
                                    ),
                                  ],
                                });
                              }}
                            >
                              Edit Group
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => openDeleteModal(group)}
                              color="red"
                              icon={<IconTrash size={14} />}
                            >
                              Delete Group
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : (
        <Center>
          <Text color="dimmed" size={16}>
            No group found.
          </Text>
        </Center>
      )}

      <Pagination
        value={page}
        onChange={handlePageChange}
        total={totalPage}
        size="sm"
        sx={{ alignSelf: "flex-end" }}
      />
    </Stack>
  );
};

export default TeamGroupList;
