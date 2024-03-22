import { getJiraUserRoleList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import {
  JiraFormslyProjectType,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
  JiraUserRoleTableRow,
} from "@/utils/types";
import { Container, LoadingOverlay, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import JiraFormslyProjectList from "./JiraFormslyProjectList/JiraFormslyProjectList";
import JiraUserAccountList from "./JiraUserAccountList/JiraUserAccountList";

type Props = {
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
  jiraProjectList: JiraProjectTableRow[];
  jiraUserAcountList: JiraUserAccountTableRow[];
  jiraUserAcountCount: number;
};

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

const JiraSettingsPage = ({
  jiraFormslyProjectList: initialJiraFormslyProjectList,
  jiraFormslyProjectCount: initialJiraFormslyProjectCount,
  jiraProjectList,
  jiraUserAcountList,
}: Props) => {
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isManagingUserAccountList, setIsManagingUserAccountList] =
    useState(false);
  const [selectedFormslyProject, setSelectedFormslyProject] = useState<
    string | null
  >(null);
  const [jiraUserRoleList, setJiraUserRoleList] = useState<
    JiraUserRoleTableRow[]
  >([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const jiraUserRoleList = await getJiraUserRoleList(supabaseClient, {
          index: 0,
          limit: ROW_PER_PAGE,
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

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Stack>
        <Title order={2}>Manage Jira Automation</Title>

        <JiraFormslyProjectList
          jiraFormslyProjectList={initialJiraFormslyProjectList}
          jiraFormslyProjectCount={initialJiraFormslyProjectCount}
          jiraProjectList={jiraProjectList}
          setIsManagingUserAccountList={setIsManagingUserAccountList}
          setSelectedFormslyProject={setSelectedFormslyProject}
          selectedFormslyProject={selectedFormslyProject}
        />
        {isManagingUserAccountList && (
          <JiraUserAccountList
            jiraUserAcountList={jiraUserAcountList}
            setIsManagingUserAccountList={setIsManagingUserAccountList}
            setSelectedFormslyProject={setSelectedFormslyProject}
            selectedFormslyProject={selectedFormslyProject}
            jiraUserRoleList={jiraUserRoleList}
          />
        )}
      </Stack>
    </Container>
  );
};

export default JiraSettingsPage;
