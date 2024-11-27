import { getNodeTypesOption } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import NodeMaker from "@/components/WorkflowPage/WorkflowPage/NodeMaker/NodeMakerPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { NodeOption } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, teamId }) => {
    try {
      const nodeTypes = await getNodeTypesOption(supabaseClient, {
        activeTeam: teamId,
      });

      return {
        props: {
          nodeTypes,
        },
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
  nodeTypes: NodeOption[];
};

const Page = ({ nodeTypes }: Props) => {
  return (
    <>
      <Meta
        description="Create Node Page"
        url="/teamName/workflows/node-maker"
      />
      <NodeMaker nodeTypes={nodeTypes} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
