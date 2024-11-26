import { getAllTeamProjects } from "@/backend/api/get";
import LRFSpreadsheetView from "@/components/LRFSpreadsheetView/LRFSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { OptionType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    try {
      const projectList = await getAllTeamProjects(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      const projectListOptions = projectList.map((project) => ({
        value: project.team_project_id,
        label: project.team_project_name,
      }));
      return {
        props: { teamId: userActiveTeam.team_id, projectListOptions },
      };
    } catch (e) {
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
  teamId: string;
  projectListOptions: OptionType[];
};

const Page = ({ teamId, projectListOptions }: Props) => {
  return (
    <>
      <Meta
        description="LRF Spreadsheet View Page"
        url="/{teamName}/requests/lrf-spreadsheet-view"
      />
      <LRFSpreadsheetView
        teamId={teamId}
        projectListOptions={projectListOptions}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
