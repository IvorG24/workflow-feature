import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Request from "@/components/RequestsPage/RequestsPage";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "../../../_app";

const RequestsPage: NextPageWithLayout = () => {
  // todo: fix meta tags
  return (
    <div>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Request activeTab="all" />
    </div>
  );
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
