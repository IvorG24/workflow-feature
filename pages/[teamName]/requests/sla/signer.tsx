import { getTeamFormSLAList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SignerSLAPage from "@/components/SignerSLAPage/SignerSLAPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { FormSLAWithFormName } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, userActiveTeam }) => {
    try {
      const slaFormList = await getTeamFormSLAList(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { slaFormList },
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
  slaFormList: FormSLAWithFormName[];
};

const Page = ({ slaFormList }: Props) => {
  return (
    <>
      <Meta
        description="Signer SLA Page"
        url="/{teamName}/requests/sla/signer"
      />
      <SignerSLAPage slaFormList={slaFormList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
