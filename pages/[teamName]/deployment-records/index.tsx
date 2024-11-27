import { checkIfGroupMember } from "@/backend/api/get";
import DeploymentAndRecordsPage from "@/components/DeploymentRecordsPage/DeploymentAndRecordsPage";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, userActiveTeam }) => {
    try {
      const iSDeploymentRecordsMember = await checkIfGroupMember(
        supabaseClient,
        {
          userId: user.id,
          groupName: ["DEPLOYMENT AND RECORDS"],
          teamId: userActiveTeam.team_id,
        }
      );
      if (!iSDeploymentRecordsMember) {
        return {
          redirect: {
            destination: "/401",
            permanent: false,
          },
        };
      }

      return {
        props: {},
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

const Page = () => {
  return (
    <>
      <Meta
        description="Deployment And Records Page"
        url="/teamName/deployment-record"
      />
      <DeploymentAndRecordsPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
