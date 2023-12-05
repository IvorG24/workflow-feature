import { getOnboardList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import OnboardingListPage from "@/components/OnboardingListPage/OnboardingListPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { UserOnboardTableRow } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user: { id } }) => {
    try {
      const onboardList = await getOnboardList(supabaseClient, {
        userId: id,
      });

      return {
        props: { onboardList },
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
  onboardList: UserOnboardTableRow[];
};

const Page = ({ onboardList }: Props) => {
  return (
    <>
      <Meta description="User Settings Page" url="/user/settings" />
      <OnboardingListPage onboardList={onboardList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
