import {
  getApplicationInformationSummaryData,
  getFormSectionWithFieldList,
} from "@/backend/api/get";
import ApplicationInformationSpreadsheetView from "@/components/ApplicationInformationpreadsheetView/ApplicationInformationSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import {
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user }) => {
    try {
      const requestList = await getApplicationInformationSummaryData(
        supabaseClient,
        {
          limit: DEFAULT_NUMBER_SSOT_ROWS,
          page: 1,
          userId: user.id,
        }
      );
      const sectionList = await getFormSectionWithFieldList(supabaseClient, {
        formId: "151cc6d7-94d7-4c54-b5ae-44de9f59d170",
      });
      return {
        props: {
          requestList,
          sectionList,
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
  requestList: ApplicationInformationSpreadsheetData[];
  sectionList: SectionWithFieldType[];
};

const Page = ({ requestList, sectionList }: Props) => {
  return (
    <>
      <Meta
        description="Application Information View Page"
        url="/{teamName}/requests/application-information-spreadsheet-view"
      />
      <ApplicationInformationSpreadsheetView
        requestList={requestList}
        sectionList={sectionList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
