import { deleteRow } from "@/backend/api/delete";
import { getNameList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { ProjectTableRow } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Group,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { uniqueId } from "lodash";
import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction, useState } from "react";

const useStyles = createStyles((theme) => ({
  checkbox: {
    input: { cursor: "pointer" },
  },
  flexGrow: {
    [theme.fn.smallerThan("lg")]: {
      flexGrow: 1,
    },
  },
  clickableColumn: {
    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.gray[7]
          : theme.colors.gray[5],
    },
    cursor: "pointer",
  },
}));

type Props = {
  projectList: ProjectTableRow[];
  setProjectList: Dispatch<SetStateAction<ProjectTableRow[]>>;
  projectCount: number;
  setProjectCount: Dispatch<SetStateAction<number>>;
  setIsCreatingProject: Dispatch<SetStateAction<boolean>>;
};

const ProjectList = ({
  projectList,
  setProjectList,
  projectCount,
  setProjectCount,
  setIsCreatingProject,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (projectId: string) => {
    if (checkList.includes(projectId)) {
      setCheckList(checkList.filter((id) => id !== projectId));
    } else {
      setCheckList([...checkList, projectId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const projectIdList = projectList.map((project) => project.project_id);
      setCheckList(projectIdList);
    } else {
      setCheckList([]);
    }
  };

  const handleSearch = async (isEmpty?: boolean) => {
    if (activePage !== 1) {
      setActivePage(1);
    }
    handleFetch(isEmpty ? "" : search, 1);
  };

  const handleFetch = async (search: string, page: number) => {
    setIsLoading(true);
    try {
      const { data, count } = await getNameList(supabaseClient, {
        table: "project",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setProjectList(data as ProjectTableRow[]);
      setProjectCount(Number(count));
    } catch {
      showNotification({
        message: "Error on fetching project list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = projectList;

    try {
      const updatedProjectList = projectList.filter((project) => {
        if (!checkList.includes(project.project_id)) {
          return project;
        }
      });
      setProjectList(updatedProjectList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "project",
      });

      showNotification({
        title: "Success!",
        message: "Project/s deleted",
        color: "green",
      });
    } catch {
      setProjectList(savedRecord);
      setCheckList(saveCheckList);
      showNotification({
        title: "Error!",
        message: "Project/s failed to delete",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (projectId: string, value: boolean) => {
    const savedRecord = projectList;
    try {
      setProjectList((prev) =>
        prev.map((project) => {
          if (project.project_id !== projectId) return project;
          return {
            ...project,
            project_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "project",
        id: projectId,
        status: value,
      });
    } catch {
      showNotification({
        message: "Error on changing status",
        color: "red",
      });
      setProjectList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Projects
          </Title>
          <TextInput
            miw={250}
            placeholder="Project Name"
            rightSection={
              <ActionIcon onClick={() => search && handleSearch()}>
                <IconSearch size={16} />
              </ActionIcon>
            }
            value={search}
            onChange={async (e) => {
              setSearch(e.target.value);
              if (e.target.value === "") {
                handleSearch(true);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                if (search) {
                  handleSearch();
                }
              }
            }}
            maxLength={4000}
            className={classes.flexGrow}
          />
        </Group>
        <Group className={classes.flexGrow}>
          {checkList.length !== 0 ? (
            <Button
              variant="outline"
              rightIcon={<IconTrash size={16} />}
              className={classes.flexGrow}
              onClick={() => {
                openConfirmModal({
                  title: <Text>Please confirm your action.</Text>,
                  children: (
                    <Text size={14}>
                      Are you sure you want to delete{" "}
                      {checkList.length === 1
                        ? "this project?"
                        : "these projects?"}
                    </Text>
                  ),
                  labels: { confirm: "Confirm", cancel: "Cancel" },
                  centered: true,
                  onConfirm: handleDelete,
                });
              }}
            >
              Delete
            </Button>
          ) : null}
          <Button
            rightIcon={<IconPlus size={16} />}
            className={classes.flexGrow}
            onClick={() => setIsCreatingProject(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="project_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={projectList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === projectList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ project_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(project_id)}
                onChange={() => {
                  handleCheckRow(project_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "project_name",
            title: "Project Name",
            render: ({ project_name }) => <Text>{project_name}</Text>,
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ project_is_available, project_id }) => (
              <Center>
                <Checkbox
                  checked={project_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(project_id, e.currentTarget.checked)
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={projectCount}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page: number) => {
          setActivePage(page);
          handleFetch(search, page);
        }}
      />
    </Box>
  );
};

export default ProjectList;
