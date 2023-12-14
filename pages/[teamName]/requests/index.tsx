// Imports
import { getRequestListOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import { RequestListItemType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user }) => {
    try {
      const requestListData = await getRequestListOnLoad(supabaseClient, {
        userId: user.id,
      });

      return {
        props: requestListData,
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
  requestList: RequestListItemType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

const Page = ({
  requestList,
  requestListCount,
  teamMemberList,
  formList,
  isFormslyTeam,
}: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/teamName/requests" />
      <RequestListPage
        teamMemberList={teamMemberList}
        formList={formList.filter(
          (form) => !UNHIDEABLE_FORMLY_FORMS.includes(form.label)
        )}
        isFormslyTeam={isFormslyTeam}
        requestList={requestList}
        requestListCount={requestListCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";