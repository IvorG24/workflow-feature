import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/RequestsPage/RequestsPage";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestsPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Request activeTab="all" />
    </div>
  );
};

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   const supabase = createServerSupabaseClient<Database>(ctx);

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const {
//     page: activePage,
//     form_type,
//     status,
//     search_query,
//     is_search,
//     filter,
//   } = ctx.query;
//   const boolean_is_search = is_search === "true";
//   const request_per_page = 8;
//   const start = (Number(activePage) - 1) * request_per_page;

//   console.log(ctx.query);

//   const request_list = await retrieveRequestList(
//     supabase,
//     start,
//     ctx.query.tid as string,
//     request_per_page,
//     form_type as string,
//     status as string,
//     search_query as string,
//     boolean_is_search,
//     filter as string,
//     user?.id
//   );

//   // const { data: request_list, error } = await supabase
//   //   .from("request_table")
//   //   .select("*");

//   console.log(request_list);

//   return {
//     props: {
//       request_list,
//     },
//   };
// };

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
