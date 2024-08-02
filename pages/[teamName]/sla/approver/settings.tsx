import { getTeamFormSLAList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SignerSLASettingsPage from "@/components/SignerSLASettingsPage/SignerSLASettingsPage";
import { ROW_PER_PAGE } from "@/utils/constant";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { FormSLAWithForm } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, teamId }) => {
    try {
      const { data: slaFormList, count: slaFormListCount } =
        await getTeamFormSLAList(supabaseClient, {
          teamId: teamId,
          search: "",
          page: 1,
          limit: ROW_PER_PAGE,
        });

      return {
        props: { slaFormList, slaFormListCount },
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
  slaFormList: FormSLAWithForm[];
  slaFormListCount?: number;
};

const Page = ({ slaFormList, slaFormListCount }: Props) => {
  return (
    <>
      <Meta
        description="Signer SLA Settings Page"
        url="/{teamName}/sla/signer/settings"
      />
      <SignerSLASettingsPage
        slaFormList={slaFormList}
        slaFormListCount={slaFormListCount || 0}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
