import LRFSpreadsheetView from "@/components/LRFSpreadsheetView/LRFSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { LRFSpreadsheetData } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user }) => {
    try {
      const { data, error } = await supabaseClient.rpc(
        "get_pcv_summary_table",
        {
          input_data: {
            userId: user.id,
          },
        }
      );
      console.log(data);
      if (error) throw error;

      return {
        props: {
          data: data as unknown as LRFSpreadsheetData[],
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
  data: LRFSpreadsheetData[];
};

const Page = ({ data }: Props) => {
  console.log(data);
  return (
    <>
      <Meta
        description="Spreadsheet View Page"
        url="/{teamName}/requests/lrf-spreadsheet-view"
      />
      <LRFSpreadsheetView data={data} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
