// this page was just used to test layout, you can delete it if you want
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestList from "@/components/Request/RequestList";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <RequestList />
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
