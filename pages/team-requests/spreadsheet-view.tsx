import { getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import SSOTSpreadsheetView from "@/components/SSOTSpreadhseetViewPage/SSOTSpreadhseetViewPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { SSOTType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const activeTeam = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (activeTeam) {
        const { data, error } = await supabaseClient.rpc("get_ssot", {
          input_data: { activeTeam: activeTeam },
        });

        if (error) throw error;
        return {
          props: { data },
        };
      } else {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }
    } catch (error) {
      console.error(error);
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
  data: SSOTType[];
};

const Page = ({ data }: Props) => {
  return (
    <>
      <Meta
        description="Spreadsheet View Page"
        url="/team-requests/requests/spreadsheet-view"
      />
      <SSOTSpreadsheetView data={data} />
    </>
  );
};

export default Page;
