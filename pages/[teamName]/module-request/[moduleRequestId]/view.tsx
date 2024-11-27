import { getModuleInformation } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import ViewAllModuleRequestPage from "@/components/ViewAllModuleRequestPage/ViewAllModuleRequestPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { ModuleData } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(async ({ context, supabaseClient }) => {
    try {
      const moduleRequestId = context.query.moduleRequestId as string;

      const moduleInformationData = await getModuleInformation(supabaseClient, {
        moduleRequestId: moduleRequestId,
      });

      return {
        props: {
          moduleRequestId: moduleRequestId,
          data: moduleInformationData,
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
  });

type Props = {
  moduleRequestId: string;
  data: ModuleData;
};

const Page = ({ moduleRequestId, data }: Props) => {
  return (
    <>
      <Meta
        description="Request Page"
        url="/teamName/module-request/[moduleRequestId]/view"
      />
      <ViewAllModuleRequestPage
        moduleData={data}
        moduleRequestId={moduleRequestId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
