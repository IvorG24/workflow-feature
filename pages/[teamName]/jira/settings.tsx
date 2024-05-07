// Imports
import {
  getJiraFormslyProjectList,
  getJiraItemCategoryList,
  getJiraOrganizationList,
  getJiraProjectList,
  getJiraUserAccountList,
} from "@/backend/api/get";
import JiraSettingsPage from "@/components/JiraSettingsPage/JiraSettingsPage";
import Meta from "@/components/Meta/Meta";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraFormslyProjectType,
  JiraOrganizationTableRow,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, teamId }) => {
    try {
      const jiraUserAccountData = await getJiraUserAccountList(supabaseClient, {
        from: 0,
        to: 256,
      });

      const { data: initialJiraFormslyProjectList, count } =
        await getJiraFormslyProjectList(supabaseClient, {
          teamId,
          from: 0,
          to: ROW_PER_PAGE,
        });

      const jiraOrganizationData = await getJiraOrganizationList(
        supabaseClient,
        {
          from: 0,
          to: 256,
        }
      );

      const jiraProjectData = await getJiraProjectList(supabaseClient, {
        from: 0,
        to: 256,
      });

      const jiraItemCategoryData = await getJiraItemCategoryList(
        supabaseClient,
        {
          from: 0,
          to: ROW_PER_PAGE - 1,
        }
      );

      const jiraFormslyProjectList = initialJiraFormslyProjectList.map(
        (project) => {
          const jiraProjectMatch = jiraProjectData.data.find(
            (jiraProject) =>
              jiraProject.jira_project_id ===
              project.assigned_jira_project?.jira_project_id
          );

          const jiraOrganizationMatch = jiraOrganizationData.data.find(
            (organization) =>
              organization.jira_organization_id ===
              project.assigned_jira_organization
                ?.jira_organization_team_project_organization_id
          );

          if (jiraProjectMatch || jiraOrganizationMatch) {
            return {
              ...project,
              assigned_jira_project: {
                ...project.assigned_jira_project,
                jira_project: jiraProjectMatch ?? null,
              },
              assigned_jira_organization: {
                ...project.assigned_jira_organization,
                jira_organization_team_project_organization:
                  jiraOrganizationMatch ?? null,
              },
            };
          } else {
            return project;
          }
        }
      );

      return {
        props: {
          jiraFormslyProjectData: {
            data: jiraFormslyProjectList,
            count: count,
          },
          jiraProjectData,
          jiraUserAccountData,
          jiraItemCategoryData,
          jiraOrganizationData: jiraOrganizationData,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

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
  jiraOrganizationData: {
    data: JiraOrganizationTableRow[];
    count: number;
  };
};

const Page = ({
  jiraFormslyProjectData,
  jiraProjectData,
  jiraUserAccountData,
  jiraItemCategoryData,
  jiraOrganizationData,
}: Props) => {
  return (
    <>
      <Meta description="Jira Settings Page" url="/teamName/jira/settings" />
      <JiraSettingsPage
        jiraFormslyProjectData={jiraFormslyProjectData}
        jiraProjectData={jiraProjectData}
        jiraUserAccountData={jiraUserAccountData}
        jiraItemCategoryData={jiraItemCategoryData}
        jiraOrganizationData={jiraOrganizationData}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
