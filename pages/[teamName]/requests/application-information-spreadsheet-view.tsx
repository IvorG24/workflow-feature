import { getFormSectionWithFieldList } from "@/backend/api/get";
import ApplicationInformationSpreadsheetView from "@/components/ApplicationInformationpreadsheetView/ApplicationInformationSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { SectionWithFieldType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const sectionList = await getFormSectionWithFieldList(supabaseClient, {
        formId: "151cc6d7-94d7-4c54-b5ae-44de9f59d170",
      });
      return {
        props: {
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
  sectionList: SectionWithFieldType[];
};

const Page = ({ sectionList }: Props) => {
  return (
    <>
      <Meta
        description="Application Information View Page"
        url="/{teamName}/requests/application-information-spreadsheet-view"
      />
      <ApplicationInformationSpreadsheetView sectionList={sectionList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
