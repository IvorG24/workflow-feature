// Imports
import {
  getJiraFormslyProjectList,
  getJiraProjectList,
  getJiraUserAccountList,
} from "@/backend/api/get";
import JiraSettingsPage from "@/components/JiraSettingsPage/JiraSettingsPage";
import Meta from "@/components/Meta/Meta";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import {
  JiraFormslyProjectType,
  JiraProjectTableRow,
  JiraUserAccountTableRow,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const jiraUserAcount = await getJiraUserAccountList(supabaseClient, {
        index: 0,
        limit: 200,
      });

      const { data: initialJiraFormslyProjectList, count } =
        await getJiraFormslyProjectList(supabaseClient, {
          index: 0,
          limit: ROW_PER_PAGE,
        });

      const jiraProjectList = await getJiraProjectList(supabaseClient, {
        index: 0,
        limit: 999,
      });

      const jiraFormslyProjectList = initialJiraFormslyProjectList.map(
        (project) => {
          const jiraProjectMatch = jiraProjectList.find(
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
          jiraProjectList,
          jiraUserAcountList: jiraUserAcount.data,
          jiraUserAcountCount: jiraUserAcount.count,
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
  jiraProjectList: JiraProjectTableRow[];
  jiraUserAcountList: JiraUserAccountTableRow[];
  jiraUserAcountCount: number;
};

const Page = ({
  jiraFormslyProjectList,
  jiraFormslyProjectCount,
  jiraProjectList,
  jiraUserAcountList,
  jiraUserAcountCount,
}: Props) => {
  return (
    <>
      <Meta description="Jira Settings Page" url="/teamName/jira/settings" />
      <JiraSettingsPage
        jiraFormslyProjectList={jiraFormslyProjectList}
        jiraFormslyProjectCount={jiraFormslyProjectCount}
        jiraProjectList={jiraProjectList}
        jiraUserAcountList={jiraUserAcountList}
        jiraUserAcountCount={jiraUserAcountCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
