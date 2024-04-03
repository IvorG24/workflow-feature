// Imports
import {
  getJiraFormslyProjectList,
  getJiraItemCategoryList,
  getJiraProjectList,
  getJiraUserAccountList,
} from "@/backend/api/get";
import JiraSettingsPage from "@/components/JiraSettingsPage/JiraSettingsPage";
import Meta from "@/components/Meta/Meta";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraFormslyProjectType,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const jiraUserAcount = await getJiraUserAccountList(supabaseClient, {
        from: 0,
        to: 256,
      });

      const { data: initialJiraFormslyProjectList, count } =
        await getJiraFormslyProjectList(supabaseClient, {
          from: 0,
          to: ROW_PER_PAGE,
        });

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

          if (jiraProjectMatch) {
            return {
              ...project,
              assigned_jira_project: {
                ...project.assigned_jira_project,
                jira_project: jiraProjectMatch,
              },
            };
          } else {
            return project;
          }
        }
      );

      return {
        props: {
          jiraFormslyProjectList: jiraFormslyProjectList,
          jiraFormslyProjectCount: count,
          jiraProjectData,
          jiraUserAccountData: jiraUserAcount,
          jiraItemCategoryData,
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
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
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

const Page = ({
  jiraFormslyProjectList,
  jiraFormslyProjectCount,
  jiraProjectData,
  jiraUserAccountData,
  jiraItemCategoryData,
}: Props) => {
  return (
    <>
      <Meta description="Jira Settings Page" url="/teamName/jira/settings" />
      <JiraSettingsPage
        jiraFormslyProjectList={jiraFormslyProjectList}
        jiraFormslyProjectCount={jiraFormslyProjectCount}
        jiraProjectData={jiraProjectData}
        jiraUserAccountData={jiraUserAccountData}
        jiraItemCategoryData={jiraItemCategoryData}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
