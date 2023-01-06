// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../_app";

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <h1>Team Dashboard page</h1>
      {/* <button onClick={() => handleFetch(router.query.tid as string, user?.id)}>
        Fetch
      </button>
      <button onClick={() => createComment()}>Create Comment</button> */}
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
