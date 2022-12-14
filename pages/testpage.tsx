// this page was just used to test layout, you can delete it if you want
import DataAnalysis from "@/components/DataAnalysis/DataAnalysis";
import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const tempData = [
  {
    label: "Open-source",
    value: 19,
  },
  {
    label: "knowledge base",
    value: 16,
  },
  {
    label: "capability",
    value: 12,
  },
  {
    label: "Multi-tiered",
    value: 22,
  },
  {
    label: "Expanded",
    value: 5,
  },
  {
    label: "Enhanced",
    value: 33,
  },
  {
    label: "installation",
    value: 28,
  },
  {
    label: "circuit",
    value: 8,
  },
  {
    label: "zero administration",
    value: 7,
  },
  {
    label: "Pre-emptive",
    value: 22,
  },
  {
    label: "Phased",
    value: 22,
  },
  {
    label: "Organic",
    value: 6,
  },
  {
    label: "zero defect",
    value: 4,
  },
  {
    label: "Customer-focused",
    value: 7,
  },
  {
    label: "function",
    value: 15,
  },
  {
    label: "leading edge",
    value: 29,
  },
  {
    label: "Re-engineered",
    value: 2,
  },
  {
    label: "didactic",
    value: 35,
  },
  {
    label: "forecast",
    value: 23,
  },
  {
    label: "neutral",
    value: 22,
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
      <DataAnalysis data={tempData} />
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
