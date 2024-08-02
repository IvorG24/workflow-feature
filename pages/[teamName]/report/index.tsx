import Meta from "@/components/Meta/Meta";
import ReportListPage from "@/components/ReportListPage/ReportListPage";
import { REPORT_LIST } from "@/utils/constant";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async () => {
    try {
      return {
        props: { reportList: REPORT_LIST },
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  reportList: typeof REPORT_LIST;
};

const Page = ({ reportList }: Props) => {
  return (
    <>
      <Meta description="Report Page" url="/{teamName}/report" />
      <ReportListPage reportList={reportList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
