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
  teamProjectList: Record<string, TeamMemberType[]>;
  onSearchTeamProject: (data: SearchForm) => void;
  page: number;
  handlePageChange: (page: number) => void;
  setIsCreatingTeamProject: Dispatch<SetStateAction<boolean>>;
  setEditProjectData: Dispatch<
    SetStateAction<
      | {
          projectName: string;
          projectMembers: string[];
        }
      | undefined
    >
  >;
  handleDeleteProject: (project: string) => void;
};

const TeamProjectList = ({
  isOwnerOrAdmin,
  teamProjectList,
  onSearchTeamProject,
  page,
  handlePageChange,
  setIsCreatingTeamProject,
  setEditProjectData,
  handleDeleteProject,
}: Props) => {
  const totalPage = Math.ceil(
    Object.keys(teamProjectList).length / DEFAULT_TEAM_GROUP_LIST_LIMIT
  );
  const totalProjects = Object.keys(teamProjectList).length;

  const { register, handleSubmit } = useFormContext<SearchForm>();

  const renderAvatar = (project: string) => {
    return teamProjectList[project].slice(0, 3).map((member) => {
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

  const renderOtherMembers = (project: string) => {
    return (
      <Tooltip
        withArrow
        label={teamProjectList[project]
          .slice(3, teamProjectList[project].length)
          .map((member) => {
            const fullName = `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`;
            return <Text key={member.team_member_id}>{fullName}</Text>;
          })}
      >
        <Avatar size={30} radius="xl">
          +{teamProjectList[project].length - 3}
        </Avatar>
      </Tooltip>
    );
  };

  const openDeleteModal = (project: string) =>
    modals.openConfirmModal({
      title: "Delete project",
      centered: true,
      children: (
        <Text size="sm">Are you sure you want to delete this project?</Text>
      ),
      labels: { confirm: "Delete project", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDeleteProject(project),
    });

  return (
    <Stack spacing={12}>
      <Flex align="center" justify="space-between">
        <Text weight={600}>Project Management</Text>
        {isOwnerOrAdmin ? (
          <Button
            compact
            onClick={() => {
              setEditProjectData(undefined);
              setIsCreatingTeamProject(true);
            }}
          >
            Add Project
          </Button>
        ) : null}
      </Flex>

      <Divider />

      <form onSubmit={handleSubmit(onSearchTeamProject)}>
        <TextInput
          placeholder="Search project"
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

      {totalProjects !== 0 ? (
        <>
          <Table fontSize={14} verticalSpacing={7} highlightOnHover>
            <thead>
              <tr>
                <th>Project</th>
                <th>Members</th>
                {isOwnerOrAdmin && <th></th>}
              </tr>
            </thead>

            <tbody>
              {Object.keys(teamProjectList).map((project) => {
                return (
                  <tr key={project}>
                    <td>{project}</td>
                    <td>
                      <Tooltip.Group openDelay={300} closeDelay={100}>
                        <Avatar.Group spacing="sm">
                          {teamProjectList[project].length !== 0 ? (
                            renderAvatar(project)
                          ) : (
                            <Tooltip withArrow label="No member/s">
                              <Avatar radius="xl" size={30} />
                            </Tooltip>
                          )}
                          {teamProjectList[project].length > 3
                            ? renderOtherMembers(project)
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
                                setIsCreatingTeamProject(true);
                                setEditProjectData({
                                  projectName: project,
                                  projectMembers: [
                                    ...teamProjectList[project].map(
                                      (member) => member.team_member_id
                                    ),
                                  ],
                                });
                              }}
                            >
                              Edit Project
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => openDeleteModal(project)}
                              color="red"
                              icon={<IconTrash size={14} />}
                            >
                              Delete Project
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
            No project found.
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

export default TeamProjectList;
