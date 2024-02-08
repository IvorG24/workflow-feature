import Meta from "@/components/Meta/Meta";
import SLAListPage from "@/components/SLAListPage/SLAListPage";
import { SLA_LIST } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async () => {
    try {
      return {
        props: { slaList: SLA_LIST },
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
  slaList: typeof SLA_LIST;
};

const Page = ({ slaList }: Props) => {
  return (
    <>
      <Meta description="Signer SLA Page" url="/{teamName}/sla/signer" />
      <SLAListPage slaList={slaList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
