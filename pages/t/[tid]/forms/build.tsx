import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestFormBuilderPage from "@/components/RequestFormBuilderPage/RequestFormBuilderPage";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestFormBuilder: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Build Request Form"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <RequestFormBuilderPage form_name="" questions={[]} />
    </div>
  );
};

RequestFormBuilder.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestFormBuilder;
