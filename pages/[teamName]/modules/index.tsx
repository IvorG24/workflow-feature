import Meta from "@/components/Meta/Meta";
import ModuleTable from "@/components/ModulesPage/ModulesTable";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { TeamMemberType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async () => {
    try {
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
type Props = {
  teamMemberList: TeamMemberType[];
};

const Page = () => {
  return (
    <>
      <Meta description="Create Modules Page" url="/teamName/modules" />
      <ModuleTable />
    </>
  );
};

export default Page;
Page.Layout = "APP";
