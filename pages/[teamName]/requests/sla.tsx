import { getQueryList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SLAPage from "@/components/SLAPage/SLAPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { QueryTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const queryList = await getQueryList(supabaseClient);

      return {
        props: { queryList },
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
  queryList: QueryTableRow[];
};

const Page = ({ queryList }: Props) => {
  return (
    <>
      <Meta description="SLA Page" url="/{teamName}/requests/sla" />
      <SLAPage queryList={queryList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
