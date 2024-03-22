import { JiraFormslyProjectType, JiraProjectTableRow } from "@/utils/types";
import { Container, Stack, Title } from "@mantine/core";
import JiraFormslyProjectList from "./JiraFormslyProjectList/JiraFormslyProjectList";

type Props = {
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
  jiraProjectList: JiraProjectTableRow[];
};

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

const JiraSettingsPage = ({
  jiraFormslyProjectList: initialJiraFormslyProjectList,
  jiraFormslyProjectCount: initialJiraFormslyProjectCount,
  jiraProjectList,
}: Props) => {
  return (
    <Container>
      <Stack>
        <Title order={2}>Manage Jira Automation</Title>

        <JiraFormslyProjectList
          jiraFormslyProjectList={initialJiraFormslyProjectList}
          jiraFormslyProjectCount={initialJiraFormslyProjectCount}
          jiraProjectList={jiraProjectList}
        />
      </Stack>
    </Container>
  );
};

export default JiraSettingsPage;
