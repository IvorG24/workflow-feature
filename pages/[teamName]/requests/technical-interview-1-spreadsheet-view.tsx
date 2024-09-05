import { getAllPoisitions } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TechnicalInterviewSpreadsheetView from "@/components/TechnicalInterviewSpreadsheetView/TechnicalInterviewSpreadsheetView";
import { withActiveTeam } from "@/utils/server-side-protections";
import { OptionType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    try {
      const data = await getAllPoisitions(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { positionOptionList: data },
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
  positionOptionList: OptionType[];
};

const Page = ({ positionOptionList }: Props) => {
  return (
    <>
      <Meta
        description="Technical Interview 1 Spreadsheet View Page"
        url="/{teamName}/requests/technical-interview-1-spreadsheet-view"
      />
      <TechnicalInterviewSpreadsheetView positionOptionList={positionOptionList} technicalInterviewNumber={1}/>
    </>
  );
};

export default Page;
Page.Layout = "APP";
