import { getWorkflowPageOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import WorkflowPage from "@/components/WorkflowPage/WorkflowPage/WorkflowPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { ReactFlowProvider } from "@xyflow/react";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, context }) => {
    try {
      const workflowId = context.query.workflowId as string;
      const data = await getWorkflowPageOnLoad(supabaseClient, {
        workflowId,
      });

      return {
        props: data,
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
  workflowVersionId: string;
  initialData?: {
    initialLabel: string;
    initialVersion: number;
  };
};

const Page = ({
  workflowVersionId = "",
  initialData = { initialLabel: "", initialVersion: 0 },
}: Props) => {
  return (
    <>
      <Meta
        description="Workflow Edit Page"
        url="/teamName/workflows/workflowId/edit"
      />
      <ReactFlowProvider>
        <WorkflowPage
          mode="edit"
          workflowVersionId={workflowVersionId}
          initialData={initialData}
        />
      </ReactFlowProvider>
    </>
  );
};

export default Page;
Page.Layout = "APP";
