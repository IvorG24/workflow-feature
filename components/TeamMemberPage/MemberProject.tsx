import { getTeamMemberProjectList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamProjectTableRow } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Divider,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SearchForm } from "../TeamPage/TeamPage";

type Props = {
  memberId: string;
  projectList: {
    team_project_member_id: string;
    team_project: TeamProjectTableRow;
  }[];
  projectCount: number;
};

const MemberProject = ({ memberId, projectList, projectCount }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const { register, handleSubmit } = useForm<SearchForm>();

  const [records, setRecords] = useState(projectList);
  const [count, setCount] = useState(projectCount);
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchTeamProject = async (data: SearchForm) => {
    try {
      setActivePage(1);
      setIsLoading(true);
      const { keyword } = data;
      const { data: projectList, count: projectCount } =
        await getTeamMemberProjectList(supabaseClient, {
          teamMemberId: memberId,
          search: keyword,
          page: 1,
          limit: ROW_PER_PAGE,
        });
      setRecords(
        projectList as unknown as {
          team_project_member_id: string;
          team_project: TeamProjectTableRow;
        }[]
      );
      setCount(projectCount ? projectCount : 0);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  return (
    <Paper p="lg" shadow="xs" mt="xl">
      <Stack spacing={12}>
        <Text weight={600}>Project List</Text>
        <Divider />

        <form onSubmit={handleSubmit(handleSearchTeamProject)}>
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
        {records.length !== 0 ? (
          <DataTable
            mt="xs"
            withBorder
            fw="bolder"
            c="dimmed"
            idAccessor="team_project_member_id"
            minHeight={390}
            records={records}
            columns={[
              {
                accessor: "team_project",
                title: "Project Name",
                render: ({ team_project }) => (
                  <Text>{team_project.team_project_name}</Text>
                ),
              },
            ]}
            totalRecords={count}
            recordsPerPage={ROW_PER_PAGE}
            page={activePage}
            onPageChange={(page) => {
              setActivePage(page);
            }}
            fetching={isLoading}
          />
        ) : (
          <Alert icon={<IconAlertCircle size="1rem" />} color="orange" mt="md">
            No project found.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default MemberProject;
