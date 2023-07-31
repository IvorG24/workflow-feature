import CreateTeamPage from "@/components/CreateTeamPage/CreateTeamPage";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async () => {
    return {
      props: {},
    };
  }
);

const Page = () => {
  return (
    <>
      <Meta description="Create Team Page" url="/team/create" />
      <CreateTeamPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
