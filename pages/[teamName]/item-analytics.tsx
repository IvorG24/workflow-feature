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
      const itemList = await getAllItems(supabaseClient, { teamId });

      return {
        props: {
          itemList,
        },
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
  itemList: { item_general_name: string }[];
};

const Page = ({ itemList }: Props) => {
  return (
    <>
      <Meta
        description="Item Analytics Page"
        url="/{teamName}/item-analytics"
      />
      <ItemAnalyticsPage itemList={itemList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
