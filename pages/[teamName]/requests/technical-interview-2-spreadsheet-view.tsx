import { checkIfGroupMember, getAllPoisitions } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TechnicalInterviewSpreadsheetView from "@/components/TechnicalInterviewSpreadsheetView/TechnicalInterviewSpreadsheetView";
import { withActiveTeam } from "@/utils/server-side-protections";
import { OptionType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, userActiveTeam }) => {
    try {
      const iSHumanResourcesMember = await checkIfGroupMember(supabaseClient, {
        userId: user.id,
        groupName: "HUMAN RESOURCES",
        teamId: userActiveTeam.team_id,
      });
      if (!iSHumanResourcesMember) {
        return {
          redirect: {
            destination: "/401",
            permanent: false,
          },
        };
      }

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
        description="Technical Interview 2 Spreadsheet View Page"
        url="/{teamName}/requests/technical-interview-2-spreadsheet-view"
      />
      <TechnicalInterviewSpreadsheetView
        positionOptionList={positionOptionList}
        technicalInterviewNumber={2}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
