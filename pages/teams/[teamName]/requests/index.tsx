import Layout from "@/components/Layout/Layout";
import RequestList from "@/components/RequestListPage/RequestList";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   const supabaseClient = createServerSupabaseClient(ctx);

//   const teamRequestList = await getTeamRequestList(
//     supabaseClient,
//     ctx.query.teamName as string
//   );

//   return {
//     props: {
//       teamRequestList,
//     },
//   };
// };

const RequestListPage: NextPageWithLayout = () => {
  return <RequestList />;
};

export default RequestListPage;

RequestListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
