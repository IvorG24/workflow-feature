import { getQueryList } from "@/backend/api/get";
import CommonQueriesPage from "@/components/CommonQueriesPage/CommonQueriesPage";
import Meta from "@/components/Meta/Meta";
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
  queryList: QueryTableRow[];
};

const Page = ({ queryList }: Props) => {
  return (
    <>
      <Meta description="SLA Page" url="/{teamName}/sla" />
      <CommonQueriesPage queryList={queryList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
