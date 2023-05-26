import {
  getFormListWithFilter,
  getTeamMemberList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestFormListPage from "@/components/RequestFormListPage/RequestFormListPage";
import { DEFAULT_FORM_LIST_LIMIT } from "@/utils/contant";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { FormWithOwnerType, TeamMemberWithUserType } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabaseClient = createServerSupabaseClient(ctx);
    const teamId = await getUserActiveTeamId(supabaseClient, {
      userId: TEMP_USER_ID,
    });

    const { data, count } = await getFormListWithFilter(supabaseClient, {
      teamId: teamId,
      app: "REQUEST",
      page: 1,
      limit: DEFAULT_FORM_LIST_LIMIT,
    });

    const teamMemberList = await getTeamMemberList(supabaseClient, {
      teamId,
    });

    return {
      props: { formList: data, formListCount: count, teamMemberList, teamId },
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
};

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
