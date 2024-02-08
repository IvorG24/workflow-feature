import { deleteRow } from "@/backend/api/delete";
import { getFileUrl, getTeamProjectList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import { TeamProjectTableRow } from "@/utils/types";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconFile, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
  projectList: TeamProjectTableRow[];
  setProjectList: Dispatch<SetStateAction<TeamProjectTableRow[]>>;
  projectCount: number;
  setProjectCount: Dispatch<SetStateAction<number>>;
  setIsCreatingProject: Dispatch<SetStateAction<boolean>>;
  setSelectedProject: Dispatch<SetStateAction<TeamProjectTableRow | null>>;
  setIsFetchingMembers: Dispatch<SetStateAction<boolean>>;
  selectedProject: TeamProjectTableRow | null;
  isOwnerOrAdmin: boolean;
};

const ProjectList = ({
  projectList,
  setProjectList,
  projectCount,
  setProjectCount,
  setIsCreatingProject,
  setSelectedProject,
  setIsFetchingMembers,
  selectedProject,
  isOwnerOrAdmin,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] =
    useState<TeamProjectTableRow[]>(projectList);

  const headerCheckboxKey = generateRandomId();

  const handleCheckRow = (projectId: string) => {
    if (checkList.includes(projectId)) {
      setCheckList(checkList.filter((id) => id !== projectId));
    } else {
      setCheckList([...checkList, projectId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const projectIdList = projectList.map(
        (project) => project.team_project_id
      );
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
      const { data, count } = await getTeamProjectList(supabaseClient, {
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setProjectList(data as TeamProjectTableRow[]);
      setProjectCount(Number(count));
      setSearchResult(data as TeamProjectTableRow[]);
    } catch (e) {
      notifications.show({
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
        if (!checkList.includes(project.team_project_id)) {
          return project;
        }
      });
      setProjectList(updatedProjectList);
      setSearchResult(updatedProjectList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "team_project",
      });

      setSelectedProject(null);

      notifications.show({
        message: "Project/s deleted.",
        color: "green",
      });
    } catch {
      setProjectList(savedRecord);
      setCheckList(saveCheckList);
      setSearchResult(savedRecord);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleColumnClick = (project_id: string) => {
    if (selectedProject?.team_project_id === project_id) return;

    setIsFetchingMembers(true);
    const newSelectedProject = projectList.find(
      (project) => project.team_project_id === project_id
    );
    setSelectedProject(newSelectedProject || null);
  };

  const handleFileClick = async (path: string) => {
    setIsLoading(true);
    try {
      const url = await getFileUrl(supabaseClient, {
        bucket: "TEAM_PROJECT_ATTACHMENTS",
        path: path,
      });
      window.open(url);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columnData: DataTableColumn<TeamProjectTableRow>[] = [
    {
      accessor: "checkbox",
      title: (
        <Checkbox
          key={headerCheckboxKey}
          className={classes.checkbox}
          checked={
            checkList.length > 0 && checkList.length === projectList.length
          }
          size="xs"
          onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
        />
      ),
      render: ({ team_project_id }) => (
        <Checkbox
          className={classes.checkbox}
          size="xs"
          checked={checkList.includes(team_project_id)}
          onChange={() => {
            handleCheckRow(team_project_id);
          }}
        />
      ),
      width: 40,
    },
    {
      accessor: "project_general_name",
      title: "Project Name",
      render: ({ team_project_name, team_project_id }) => (
        <Text
          className={classes.clickableColumn}
          onClick={() => {
            handleColumnClick(team_project_id);
          }}
        >
          {team_project_name}
        </Text>
      ),
    },
    {
      accessor: "project_initials",
      title: "Project Initials",
      render: ({ team_project_code, team_project_id }) => (
        <Text
          className={classes.clickableColumn}
          onClick={() => {
            handleColumnClick(team_project_id);
          }}
        >
          {team_project_code}
        </Text>
      ),
    },
    {
      accessor: "team_project_site_map_attachment_id",
      title: "Site Map",
      textAlignment: "center",
      render: ({ team_project_site_map_attachment_id }) =>
        team_project_site_map_attachment_id && (
          <Badge
            className={classes.clickableColumn}
            onClick={() => {
              handleFileClick(team_project_site_map_attachment_id);
            }}
          >
            <Flex align="center" justify="center" gap={3}>
              <IconFile size={14} /> <Text>File</Text>
            </Flex>
          </Badge>
        ),
    },
    {
      accessor: "team_project_boq_attachment_id",
      title: "BOQ",
      textAlignment: "center",
      render: ({ team_project_boq_attachment_id }) =>
        team_project_boq_attachment_id && (
          <Badge
            className={classes.clickableColumn}
            onClick={() => {
              handleFileClick(team_project_boq_attachment_id);
            }}
          >
            <Flex align="center" justify="center" gap={3}>
              <IconFile size={14} /> <Text>File</Text>
            </Flex>
          </Badge>
        ),
    },
  ];

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime-team-project")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_project_table",
          filter: `team_project_team_id=eq.${activeTeam.team_id}`,
        },
        async (payload) => {
          if (payload.eventType === "UPDATE") {
            const isProjectDisabled = payload.new.team_project_is_disabled;
            if (isProjectDisabled) {
              const updatedProjectList = projectList.filter(
                (project) =>
                  project.team_project_id !== payload.new.team_project_id
              );
              setProjectList(updatedProjectList);

              setSearchResult(
                updatedProjectList.filter((project) =>
                  project.team_project_name
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
              );
            }
          }

          if (payload.eventType === "INSERT") {
            const updatedProjectList = [payload.new, ...projectList];
            setProjectList(updatedProjectList as TeamProjectTableRow[]);
            setProjectCount(updatedProjectList.length);

            const searchIncludesNewProject = payload.new.team_project_name
              .toLowerCase()
              .includes(search.toLowerCase());

            if (searchIncludesNewProject) {
              setSearchResult(updatedProjectList as TeamProjectTableRow[]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, activeTeam.team_id, projectList]);

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            Team Projects
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
            onKeyUp={(e) => {
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
          {isOwnerOrAdmin && (
            <Button
              rightIcon={<IconPlus size={16} />}
              className={classes.flexGrow}
              onClick={() => setIsCreatingProject(true)}
            >
              Add
            </Button>
          )}
        </Group>
      </Flex>
      <DataTable
        idAccessor="team_project_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={searchResult}
        columns={columnData.slice(isOwnerOrAdmin ? 0 : 1)}
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
