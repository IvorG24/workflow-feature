// TODO: This is an MVP of notifications page only.
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import NotificationPage from "@/components/NotificationPage/NotificationPage";
import { Flex } from "@mantine/core";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Flex justify={{ base: "center", md: "flex-start" }}>
        <NotificationPage />
      </Flex>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
