import { getTeamMemberList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import ReportIncidentReportPage from "@/components/ReportIncidentReport/ReportIncidentReportPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { TeamMemberType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    try {
      const teamMemberList = await getTeamMemberList(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { teamMemberList },
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
  teamMemberList: TeamMemberType[];
};

const Page = ({ teamMemberList }: Props) => {
  return (
    <>
      <Meta
        description="Incident Report Page"
        url="/{teamName}/report/incident-report"
      />
      <ReportIncidentReportPage teamMemberList={teamMemberList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
