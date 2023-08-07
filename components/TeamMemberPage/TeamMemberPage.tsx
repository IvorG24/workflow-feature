import { ROW_PER_PAGE } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { TeamMemberTableRow, UserTableRow } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Avatar,
  Container,
  Divider,
  Flex,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { toUpper } from "lodash";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SearchForm } from "../TeamPage/TeamPage";

type Props = {
  member: TeamMemberTableRow & { team_member_user: UserTableRow };
};

const TeamMemberPage = ({ member }: Props) => {
  const { register: groupRegister, handleSubmit: groupSubmit } =
    useForm<SearchForm>();
  const { register: projectRegister, handleSubmit: projectSubmit } =
    useForm<SearchForm>();

  const [groupActivePage, setGroupActivePage] = useState(1);
  const [projectActivePage, setProjectActivePage] = useState(1);

  const [groupRecords, setGroupRecords] = useState(
    member.team_member_group_list.map((group, index) => {
      return {
        id: index,
        group: group,
      };
    })
  );

  const [projectRecords, setProjectRecords] = useState(
    member.team_member_project_list.map((project, index) => {
      return {
        id: index,
        project: project,
      };
    })
  );

  const handleSearchTeamGroup = async (data: SearchForm) => {
    setGroupActivePage(1);
    const { keyword } = data;
    const newGroup: { id: number; group: string }[] = [];
    member.team_member_group_list.forEach((group, index) => {
      if (toUpper(group).includes(toUpper(keyword))) {
        newGroup.push({
          id: index,
          group: group,
        });
      }
    });
    setGroupRecords(newGroup);
  };

  const handleSearchTeamProject = async (data: SearchForm) => {
    setProjectActivePage(1);
    const { keyword } = data;
    const newProject: { id: number; project: string }[] = [];
    member.team_member_project_list.forEach((project, index) => {
      if (toUpper(project).includes(toUpper(keyword))) {
        newProject.push({
          id: index,
          project: project,
        });
      }
    });
    setProjectRecords(newProject);
  };

  return (
    <Container>
      <Title order={2}>Member Profile</Title>
      <Paper p="lg" shadow="xs" mt="xl">
        <Stack spacing={12}>
          <Text weight={600}>Personal Info</Text>
          <Divider />

          <Flex mt="md" justify="space-between" gap="xl" wrap="wrap">
            <Avatar
              size={150}
              src={member.team_member_user.user_avatar}
              color={getAvatarColor(
                Number(`${member.team_member_user.user_id.charCodeAt(0)}`)
              )}
              radius={150}
            >
              {toUpper(member.team_member_user.user_first_name[0])}
              {toUpper(member.team_member_user.user_last_name[0])}
            </Avatar>
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <TextInput
              w="100%"
              label="Username"
              variant="filled"
              readOnly
              value={member.team_member_user.user_username}
            />
            <TextInput
              w="100%"
              label="Email"
              variant="filled"
              readOnly
              value={member.team_member_user.user_email}
            />
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <TextInput
              w="100%"
              label="First Name"
              variant="filled"
              readOnly
              value={member.team_member_user.user_first_name}
            />
            <TextInput
              w="100%"
              label="Last Name"
              variant="filled"
              readOnly
              value={member.team_member_user.user_last_name}
            />
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <NumberInput
              w="100%"
              label="Mobile Number"
              maxLength={10}
              hideControls
              icon="+63"
              min={0}
              max={9999999999}
              variant="filled"
              readOnly
              value={Number(member.team_member_user.user_phone_number)}
            />
            <TextInput
              w="100%"
              label="Job Title"
              variant="filled"
              readOnly
              value={`${member.team_member_user.user_job_title}`}
            />
          </Flex>
        </Stack>
      </Paper>

      <Paper p="lg" shadow="xs" mt="xl">
        <Stack spacing={12}>
          <Text weight={600}>Group List</Text>
          <Divider />

          <form onSubmit={groupSubmit(handleSearchTeamGroup)}>
            <TextInput
              placeholder="Search group"
              rightSection={
                <ActionIcon size="xs" type="submit">
                  <IconSearch />
                </ActionIcon>
              }
              maw={350}
              mt="xs"
              {...groupRegister("keyword")}
            />
          </form>
          {groupRecords.length !== 0 ? (
            <DataTable
              mt="xs"
              withBorder
              fw="bolder"
              c="dimmed"
              minHeight={390}
              records={groupRecords.slice(
                (groupActivePage - 1) * ROW_PER_PAGE,
                (groupActivePage - 1) * ROW_PER_PAGE + ROW_PER_PAGE
              )}
              columns={[{ accessor: "group", title: "Group Name" }]}
              totalRecords={member.team_member_group_list.length}
              recordsPerPage={ROW_PER_PAGE}
              page={groupActivePage}
              onPageChange={(page) => {
                setGroupActivePage(page);
              }}
            />
          ) : (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="md"
            >
              No group found.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper p="lg" shadow="xs" mt="xl">
        <Stack spacing={12}>
          <Text weight={600}>Project List</Text>
          <Divider />

          <form onSubmit={projectSubmit(handleSearchTeamProject)}>
            <TextInput
              placeholder="Search project"
              rightSection={
                <ActionIcon size="xs" type="submit">
                  <IconSearch />
                </ActionIcon>
              }
              maw={350}
              mt="xs"
              {...projectRegister("keyword")}
            />
          </form>
          {projectRecords.length !== 0 ? (
            <DataTable
              mt="xs"
              withBorder
              fw="bolder"
              c="dimmed"
              minHeight={390}
              records={projectRecords.slice(
                (projectActivePage - 1) * ROW_PER_PAGE,
                (projectActivePage - 1) * ROW_PER_PAGE + ROW_PER_PAGE
              )}
              columns={[{ accessor: "project", title: "Project Name" }]}
              totalRecords={member.team_member_project_list.length}
              recordsPerPage={ROW_PER_PAGE}
              page={projectActivePage}
              onPageChange={(page) => {
                setProjectActivePage(page);
              }}
            />
          ) : (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="md"
            >
              No project found.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default TeamMemberPage;
