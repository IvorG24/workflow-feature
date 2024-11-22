import { getLRFSummaryData } from "@/backend/api/get";
import LRFSpreadsheetView from "@/components/LRFSpreadsheetView/LRFSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import { LRFSpreadsheetData, OptionType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user }) => {
    try {
      const data = await getLRFSummaryData(supabaseClient, {
        userId: user.id,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page: 1,
        sortFilter: "DESC",
      });

      return {
        props: data as {
          data: LRFSpreadsheetData[];
          count: number;
          projectListOptions: OptionType[];
        },
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
  data: LRFSpreadsheetData[];
  count: number;
  projectListOptions: OptionType[];
};

const Page = ({ data, projectListOptions }: Props) => {
  return (
    <>
      <Meta
        description="Spreadsheet View Page"
        url="/{teamName}/requests/lrf-spreadsheet-view"
      />
      <LRFSpreadsheetView
        initialData={data}
        projectListOptions={projectListOptions}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
