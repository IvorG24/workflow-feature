import { getFormSectionWithFieldList } from "@/backend/api/get";
import ApplicationInformationSpreadsheetView from "@/components/ApplicationInformationpreadsheetView/ApplicationInformationSpreadsheetView";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import {
  ApplicationInformationFieldOptionType,
  SectionWithFieldType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient }) => {
    try {
      const data = await getFormSectionWithFieldList(supabaseClient, {
        formId: "151cc6d7-94d7-4c54-b5ae-44de9f59d170",
      });
      return {
        props: { ...data },
      };
    } catch (e) {
      console.log(e);
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
  optionList: ApplicationInformationFieldOptionType[];
};

const Page = ({ sectionList, optionList }: Props) => {
  return (
    <>
      <Meta
        description="Application Information View Page"
        url="/{teamName}/requests/application-information-spreadsheet-view"
      />
      <ApplicationInformationSpreadsheetView
        sectionList={sectionList}
        optionList={optionList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
