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
    value: 22,
  },
  {
    label: "tangible",
    value: 10,
  },
  {
    label: "adaptive",
    value: 29,
  },
  {
    label: "open architecture",
    value: 9,
  },
  {
    label: "synergistic",
    value: 34,
  },
  {
    label: "user-friendly",
    value: 29,
  },
  {
    label: "disintermediate",
    value: 27,
  },
  {
    label: "portal",
    value: 19,
  },
  {
    label: "structure",
    value: 20,
  },
  {
    label: "up-sized",
    value: 32,
  },
  {
    label: "optimized",
    value: 28,
  },
  {
    label: "pricing structure",
    value: 32,
  },
  {
    label: "5th generation",
    value: 37,
  },
  {
    label: "versatile",
    value: 5,
  },
  {
    label: "multi-state",
    value: 36,
  },
  {
    label: "collaboration",
    value: 35,
  },
  {
    label: "interface",
    value: 7,
  },
  {
    label: "user-centric",
    value: 16,
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
      </Box>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
