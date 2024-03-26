import { getJiraUserRoleList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { startCase } from "@/utils/string";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraFormslyProjectType,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
  JiraUserRoleTableRow,
} from "@/utils/types";
import { Container, LoadingOverlay, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import JiraFormslyItemCategoryList from "./JiraFormslyItemCategoryList/JiraFormslyItemCategoryList";
import JiraFormslyProjectList from "./JiraFormslyProjectList/JiraFormslyProjectList";
import JiraUserAccountList from "./JiraUserAccountList/JiraUserAccountList";

type Props = {
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
  jiraProjectList: JiraProjectTableRow[];
  jiraUserAcountList: JiraUserAccountTableRow[];
  jiraUserAcountCount: number;
  jiraItemCategoryData: {
    data: JiraFormslyItemCategoryWithUserDataType[];
    count: number;
  };
};

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

const JiraSettingsPage = ({
  jiraFormslyProjectList: initialJiraFormslyProjectList,
  jiraFormslyProjectCount: initialJiraFormslyProjectCount,
  jiraProjectList,
  jiraUserAcountList,
  jiraItemCategoryData,
}: Props) => {
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isManagingUserAccountList, setIsManagingUserAccountList] =
    useState(false);
  const [selectedFormslyProjectId, setSelectedFormslyProjectId] = useState<
    string | null
  >(null);
  const [selectedFormslyProjectName, setSelectedFormslyProjectName] =
    useState("");
  const [jiraUserRoleList, setJiraUserRoleList] = useState<
    JiraUserRoleTableRow[]
  >([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const jiraUserRoleList = await getJiraUserRoleList(supabaseClient, {
          from: 0,
          to: ROW_PER_PAGE,
        });

        setJiraUserRoleList(jiraUserRoleList);
      } catch (error) {
        console.log(error);
        notifications.show({
          message: "Failed to fetch client data",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, []);

  useEffect(() => {
    if (selectedFormslyProjectId) {
      const projectMatch = initialJiraFormslyProjectList.find(
        (project) => project.team_project_id === selectedFormslyProjectId
      );
      if (!projectMatch) return;
      setSelectedFormslyProjectName(startCase(projectMatch.team_project_name));
    }
  }, [selectedFormslyProjectId]);

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Stack>
        <Title order={2}>Manage Jira Automation</Title>
        <Text>
          Manage, update, and assign JIRA users to Team Projects and Item
          Categories.
        </Text>

        <JiraFormslyProjectList
          jiraFormslyProjectList={initialJiraFormslyProjectList}
          jiraFormslyProjectCount={initialJiraFormslyProjectCount}
          jiraProjectList={jiraProjectList}
          setIsManagingUserAccountList={setIsManagingUserAccountList}
          setSelectedFormslyProject={setSelectedFormslyProjectId}
          selectedFormslyProject={selectedFormslyProjectId}
        />
        {isManagingUserAccountList && (
          <JiraUserAccountList
            jiraUserAcountList={jiraUserAcountList}
            setIsManagingUserAccountList={setIsManagingUserAccountList}
            setSelectedFormslyProject={setSelectedFormslyProjectId}
            selectedFormslyProject={selectedFormslyProjectId}
            selectedFormslyProjectName={selectedFormslyProjectName}
            jiraUserRoleList={jiraUserRoleList}
          />
        )}

        <JiraFormslyItemCategoryList
          jiraItemCategoryData={jiraItemCategoryData}
          jiraUserAcountList={jiraUserAcountList}
          jiraUserRoleList={jiraUserRoleList}
        />
      </Stack>
    </Container>
  );
};

export default JiraSettingsPage;
