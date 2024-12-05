import { checkIfOwnerOrAdmin } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import WorkflowPage from "@/components/WorkflowPage/WorkflowPage/WorkflowPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { ReactFlowProvider } from "@xyflow/react";
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
        description="Create Workflow Page"
        url="/teamName/workflows/create"
      />
      <ReactFlowProvider>
        <WorkflowPage mode="create" />
      </ReactFlowProvider>
    </>
  );
};

export default Page;
Page.Layout = "APP";
