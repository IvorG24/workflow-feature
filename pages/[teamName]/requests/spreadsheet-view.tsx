import { getSSOTOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SSOTSpreadsheetView from "@/components/SSOTSpreadhseetViewPage/SSOTSpreadhseetViewPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { SSOTType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user }) => {
    try {
      const ssotData = await getSSOTOnLoad(supabaseClient, {
        userId: user.id,
      });

      return {
        props: ssotData,
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
  data: SSOTType[];
  projectNameList: string[];
  itemNameList: string[];
};

const Page = ({ data, projectNameList, itemNameList }: Props) => {
  return (
    <>
      <Meta
        description="Spreadsheet View Page"
        url="/{teamName}/requests/spreadsheet-view"
      />
      <SSOTSpreadsheetView
        data={data}
        requestingProjectList={projectNameList}
        itemNameList={itemNameList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
