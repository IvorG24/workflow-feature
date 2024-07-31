import { getMemo } from "@/backend/api/get";
import MemoPage from "@/components/Memo/MemoPage";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { MemoType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, context, user }) => {
    try {
      const { memoId } = context.query;
      if (!memoId) {
        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      }

      const memo = await getMemo(supabaseClient, {
        memo_id: `${memoId}`,
        current_user_id: user.id,
      });

      return {
        props: { memo },
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
  memo: MemoType;
};

const Page = ({ memo }: Props) => {
  return (
    <>
      <Meta description="Memo Page" url="/teamName/memo/memoId" />
      <MemoPage memo={memo} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
