// Imports
import { getPublicFormList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import UserRequestListPage from "@/components/UserRequestListPage/UserRequestListPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { FormTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient }) => {
    try {
      const formList = await getPublicFormList(supabaseClient);
      return {
        props: { formList },
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
  formList: FormTableRow[];
};

const Page = ({ formList }: Props) => {
  return (
    <>
      <Meta description="User Request List Page" url="/user/requests" />
      <UserRequestListPage formList={formList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
