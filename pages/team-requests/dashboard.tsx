import {
  getAllTeamMembers,
  getRequestList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Dashboard from "@/components/Dashboard/Dashboard";
import Meta from "@/components/Meta/Meta";
import {
  TEMP_ORDER_TO_PURCHASE_FORM_TEAM_DATA,
  TEMP_ORDER_TO_PURCHASE_FORM_USER_DATA,
  TEMP_ORDER_TO_PURCHASE_PURCHASE_DATA,
} from "@/utils/dummyData";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";
import { OTPDataType } from "./forms/[formId]/analytics";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) throw Error;

      const { data, count } = await getRequestList(supabaseClient, {
        teamId: teamId,
        page: 1,
        limit: 9999999,
      });

      const teamMemberList = await getAllTeamMembers(supabaseClient, {
        teamId,
      });

      const teamData = TEMP_ORDER_TO_PURCHASE_FORM_TEAM_DATA;
      const userData = TEMP_ORDER_TO_PURCHASE_FORM_USER_DATA;
      const purchaseData = TEMP_ORDER_TO_PURCHASE_PURCHASE_DATA;

      return {
        props: {
          requestList: data,
          requestListCount: count,
          teamMemberList,
          requisition_form_team_data: teamData,
          requisition_form_user_data: userData,
          requisition_form_purchase_data: purchaseData,
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
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  requisition_form_team_data: OTPDataType;
  requisition_form_user_data: OTPDataType;
  requisition_form_purchase_data: OTPDataType;
};

const Page = ({
  requestList,
  requestListCount,
  teamMemberList,
  requisition_form_team_data,
  requisition_form_user_data,
  requisition_form_purchase_data,
}: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <Dashboard
        requestList={requestList}
        requestListCount={requestListCount}
        teamMemberList={teamMemberList}
        teamRequisitionData={requisition_form_team_data}
        userRequisitionData={requisition_form_user_data}
        purchaseRequisitionData={requisition_form_purchase_data}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
