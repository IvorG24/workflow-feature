// this page was just used to test layout, you can delete it if you want
import ItemList from "@/components/ItemList/ItemList";
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const itemData = [
  {
    id: "a",
    question: "What are the employee’s strongest points?",
    reponse_type: "text",
    required: true,
    tooltip: "this is a tooltip",
  },
  {
    id: "b",
    question: "What are the employee’s weakest points?",
    reponse_type: "text",
    required: false,
    tooltip: "this is a tooltip",
  },
  {
    id: "c",
    question:
      "What can the employee do to be more effective  or make improvements?",
    reponse_type: "text",
    required: true,
    tooltip: "this is a tooltip",
  },
  {
    id: "d",
    question: "What additional training would benefit the employee?",
    reponse_type: "text",
    required: true,
    tooltip: "this is a tooltip",
  },
];

const itemOrder = ["a", "b", "c", "d"];

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <ItemList data={itemData} order={itemOrder} />
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default Page;
