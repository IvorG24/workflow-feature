import Meta from "@/components/Meta/Meta";
import RequestFormListPage from "@/components/RequestFormListPage/RequestFormListPage";
import { sortFormList } from "@/utils/arrayFunctions/arrayFunctions";
import { DEFAULT_FORM_LIST_LIMIT, FORMSLY_FORM_ORDER } from "@/utils/constant";
import { withOwnerOrAdmin } from "@/utils/server-side-protections";
import { FormWithOwnerType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrAdmin(
  async ({ supabaseClient, user }) => {
    try {
      const { data, error } = await supabaseClient.rpc("form_page_on_load", {
        input_data: {
          userId: user.id,
          limit: DEFAULT_FORM_LIST_LIMIT,
        },
      });
      if (error) throw error;
      const formattedData = data as unknown as Props;
      return {
        props: {
          ...formattedData,
          formList: sortFormList(formattedData.formList, FORMSLY_FORM_ORDER),
        },
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
  formList: FormWithOwnerType[];
  formListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamId: string;
};

const Page = ({ formList, formListCount, teamMemberList, teamId }: Props) => {
  return (
    <>
      <Meta description="Form List Page" url="/team-requests/forms/" />
      <RequestFormListPage
        formList={formList}
        formListCount={formListCount}
        teamMemberList={teamMemberList}
        teamId={teamId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
