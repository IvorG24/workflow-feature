// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../_app";

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const { tid } = router.query;
  console.log(tid);
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      tespage
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Page;
