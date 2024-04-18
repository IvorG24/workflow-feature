import { getJiraUserRoleList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { startCase } from "@/utils/string";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraFormslyProjectType,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
  JiraUserRoleTableRow,
} from "@/utils/types";
import {
  Center,
  Container,
  LoadingOverlay,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import JiraFormslyItemCategoryList from "./JiraFormslyItemCategoryList/JiraFormslyItemCategoryList";
import JiraFormslyProjectList from "./JiraFormslyProjectList/JiraFormslyProjectList";
import JiraProjectLookupTable from "./JiraProjectLookupTable/JiraProjectLookupTable";
import JiraUserAccountList from "./JiraUserAccountList/JiraUserAccountList";
import JiraUserLookupTable from "./JiraUserLookupTable/JiraUserLookupTable";

type Props = {
  jiraFormslyProjectData: {
    data: JiraFormslyProjectType[];
    count: number;
  };
  jiraProjectData: {
    data: JiraProjectTableRow[];
    count: number;
  };
  jiraUserAccountData: {
    data: JiraUserAccountTableRow[];
    count: number;
  };
  jiraItemCategoryData: {
    data: JiraFormslyItemCategoryWithUserDataType[];
    count: number;
  };
};

type JiraAutomationFormFieldType = {
  choices?: { id: string; name: string }[];
  jiraField: {
    id: string;
    configId: string;
    custom: string;
    type: string;
  };
  answer: object;
};

export type JiraAutomationFormObject = Record<
  string,
  JiraAutomationFormFieldType
>;

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

const JiraSettingsPage = ({
  jiraFormslyProjectData,
  jiraProjectData,
  jiraUserAccountData,
  jiraItemCategoryData,
}: Props) => {
  const initialJiraFormslyProjectList = jiraFormslyProjectData.data;
  const initialJiraFormslyProjectCount = jiraFormslyProjectData.count;

  const supabaseClient = createPagesBrowserClient<Database>();

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
  const [segmentedControlValue, setSegmentedControlValue] =
    useState("jira-settings");

  const [jiraAutomationFormData, setJiraAutomationFormData] =
    useState<JiraAutomationFormObject | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const jiraUserRoleList = await getJiraUserRoleList(supabaseClient, {
          from: 0,
          to: ROW_PER_PAGE,
        });

        setJiraUserRoleList(jiraUserRoleList);

        const response = await fetch("/api/get-jira-automation-form", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setJiraAutomationFormData(data.fields);
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
      <Title order={2}>Manage Jira Automation</Title>
      <Paper mt="sm" p="xl" shadow="xs" pos="relative">
        <Text>
          Easily link Formsly projects and item categories to Jira: add, update,
          and assign them hassle-free.
        </Text>
      </Paper>

      <Center my="sm">
        <SegmentedControl
          data={[
            { label: "Jira Settings", value: "jira-settings" },
            { label: "Jira Lookup", value: "jira-lookup" },
          ]}
          value={segmentedControlValue}
          onChange={setSegmentedControlValue}
        />
      </Center>
      {segmentedControlValue === "jira-settings" && (
        <Stack>
          <JiraFormslyProjectList
            jiraFormslyProjectList={initialJiraFormslyProjectList}
            jiraFormslyProjectCount={initialJiraFormslyProjectCount}
            jiraProjectList={jiraProjectData.data}
            setIsManagingUserAccountList={setIsManagingUserAccountList}
            setSelectedFormslyProject={setSelectedFormslyProjectId}
            selectedFormslyProject={selectedFormslyProjectId}
          />
          {isManagingUserAccountList && (
            <JiraUserAccountList
              jiraUserAcountList={jiraUserAccountData.data}
              setIsManagingUserAccountList={setIsManagingUserAccountList}
              setSelectedFormslyProject={setSelectedFormslyProjectId}
              selectedFormslyProject={selectedFormslyProjectId}
              selectedFormslyProjectName={selectedFormslyProjectName}
              jiraUserRoleList={jiraUserRoleList}
            />
          )}

          <JiraFormslyItemCategoryList
            jiraItemCategoryData={jiraItemCategoryData}
            jiraUserAcountList={jiraUserAccountData.data}
            jiraUserRoleList={jiraUserRoleList}
            jiraAutomationFormData={jiraAutomationFormData}
          />
        </Stack>
      )}
      {segmentedControlValue === "jira-lookup" && (
        <Stack>
          <JiraProjectLookupTable
            jiraProjectData={jiraProjectData}
            jiraAutomationFormData={jiraAutomationFormData}
          />
          <JiraUserLookupTable jiraUserAccountData={jiraUserAccountData} />
        </Stack>
      )}
    </Container>
  );
};

export default JiraSettingsPage;
