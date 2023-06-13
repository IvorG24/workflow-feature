// Imports
import {
  getAllTeamMembers,
  getRequestList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      const [data, teamMemberList] = await Promise.all([
        getRequestList(supabaseClient, {
          teamId: teamId,
          page: 1,
          limit: DEFAULT_REQUEST_LIST_LIMIT,
        }),
        getAllTeamMembers(supabaseClient, {
          teamId,
        }),
      ]);

      return {
        props: {
          requestListData: data.data,
          requestListCount: data.count,
          teamMemberList,
        },
      };
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
  requestListData: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({ requestListData, requestListCount, teamMemberList }: Props) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [requestList, setRequestList] =
    useState<RequestType[]>(requestListData);

  useEffect(() => {
    async function fetchRequestList() {
      try {
        if (activeTeam.team_id) {
          const { data } = await getRequestList(supabaseClient, {
            teamId: activeTeam.team_id,
            page: 1,
            limit: DEFAULT_REQUEST_LIST_LIMIT,
          });

          if (data.length === requestListData.length) {
            const isDifferent = data[0] !== requestListData[0];
            if (isDifferent) {
              setRequestList(data as RequestType[]);
            }
            return;
          }

          setRequestList(data as RequestType[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchRequestList();
  }, [activeTeam.team_id, supabaseClient, requestListData]);

  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage
        requestList={requestList}
        requestListCount={requestListCount}
        teamMemberList={teamMemberList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
