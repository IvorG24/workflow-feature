import { getAllItems, getUserActiveTeamId } from "@/backend/api/get";
import ItemAnalyticsPage from "@/components/ItemAnalyticsPage/ItemAnalyticsPage";
import Meta from "@/components/Meta/Meta";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      const items = await getAllItems(supabaseClient, { teamId });

      return {
        props: {
          items,
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
  items: { item_general_name: string }[];
};

const Page = ({ items }: Props) => {
  return (
    <>
      <Meta
        description="Item Analytics Page"
        url="/{teamName}/item-analytics"
      />
      <ItemAnalyticsPage items={items} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
