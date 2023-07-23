import {
  getAllItems,
  getMemberProjectList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SSOTSpreadsheetView from "@/components/SSOTSpreadhseetViewPage/SSOTSpreadhseetViewPage";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { SSOTType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const activeTeam = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (activeTeam) {
        const { data, error } = await supabaseClient.rpc("get_ssot", {
          input_data: {
            activeTeam: activeTeam,
            pageNumber: 1,
            rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
            search: "",
            otpCondition: [],
          },
        });
        if (error) throw error;

        const projectNameList = await getMemberProjectList(supabaseClient, {
          teamId: activeTeam,
          userId: user.id,
        });

        const itemList = await getAllItems(supabaseClient, {
          teamId: activeTeam,
        });

        const itemNameList = itemList.map((item) => item.item_general_name);

        return {
          props: { data, projectNameList, itemNameList },
        };
      } else {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }
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
  data: SSOTType[];
  projectNameList: string[];
  itemNameList: string[];
};

const Page = ({ data, projectNameList, itemNameList }: Props) => {
  return (
    <>
      <Meta
        description="Spreadsheet View Page"
        url="/team-requests/requests/spreadsheet-view"
      />
      <SSOTSpreadsheetView
        data={data}
        projectNameList={projectNameList}
        itemNameList={itemNameList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
