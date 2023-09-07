import BuildRequestFormPage from "@/components/BuildRequestFormPage/BuildRequestFormPage";
import Meta from "@/components/Meta/Meta";
import { withOwnerOrAdmin } from "@/utils/server-side-protections";
import { TeamGroupTableRow, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrAdmin(
  async ({ supabaseClient, user }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "build_form_page_on_load",
        {
          input_data: {
            userId: user.id,
          },
        }
      );
      if (error) throw error;

      return {
        props: { ...(data as unknown as Props) },
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
  teamMemberList: TeamMemberWithUserType[];
  formId: string;
  groupList: TeamGroupTableRow[];
};

const Page = ({ teamMemberList, formId, groupList }: Props) => {
  return (
    <>
      <Meta description="Build Request Page" url="/team-requests/forms/build" />
      <BuildRequestFormPage
        teamMemberList={teamMemberList}
        formId={formId}
        groupList={groupList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
