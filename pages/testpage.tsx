// this page was just used to test layout, you can delete it if you want
import DataAnalysis from "@/components/DataAnalysis/DataAnalysis";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { Box } from "@mantine/core";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const tempData = [
  {
    label: "progressive",
    value: 38,
  },
  {
    label: "digitized",
    value: 12,
  },
  {
    label: "tangible",
    value: 85,
  },
  {
    label: "adaptive",
    value: 57,
  },

  {
    label: "synergistic",
    value: 100,
  },
  {
    label: "portal",
    value: 75,
  },
  {
    label: "structure",
    value: 20,
  },
  {
    label: "up-sized",
    value: 48,
  },
  {
    label: "optimized",
    value: 88,
  },
  {
    label: "versatile",
    value: 45,
  },
  {
    label: "interface",
    value: 32,
  },
];

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Box maw="800px">
        <DataAnalysis data={tempData} />
        <DataAnalysis data={tempData} chartType="line" />
        <DataAnalysis data={tempData} chartType="radar" />
      </Box>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
