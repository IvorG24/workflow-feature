// Imports
import {
  checkIfGroupMember,
  getPreferredPositionOnLoad,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import PreferredPositionPage from "@/components/PreferredPositionPage/PreferredPositionPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { PreferredPositionType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, userActiveTeam }) => {
    try {
      const iSHumanResourcesMember = await checkIfGroupMember(supabaseClient, {
        userId: user.id,
        groupName: [
          "HUMAN RESOURCES",
          "HUMAN RESOURCES VIEWER",
          "HUMAN RESOURCES COORDINATOR",
        ],
        teamId: userActiveTeam.team_id,
      });
      if (!iSHumanResourcesMember) {
        return {
          redirect: {
            destination: "/401",
            permanent: false,
          },
        };
      }
      const data = await getPreferredPositionOnLoad(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: {
          ...data,
        },
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
  groupMemberData: PreferredPositionType[];
  totalCount: number;
};

const Page = ({ groupMemberData, totalCount }: Props) => {
  return (
    <>
      <Meta
        description="Preferred Position Page"
        url="/teamName/preferred-position"
      />
      <PreferredPositionPage
        groupMembers={groupMemberData}
        totalCount={totalCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
