import { checkIfOwnerOrAdmin } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NodeMaker from "@/components/WorkflowPage/WorkflowPage/NodeMaker/NodeMakerPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, user, teamId }) => {
    try {
      const isOwnerOrApprover = await checkIfOwnerOrAdmin(supabaseClient, {
        userId: user.id,
        teamId: teamId,
      });

      if (!isOwnerOrApprover) {
        return {
          redirect: {
            destination: "/500",
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
        description="Create Node Page"
        url="/teamName/workflows/node-maker"
      />
      <NodeMaker />
    </>
  );
};

export default Page;
Page.Layout = "APP";
