// TODO: Redirect '/requests' to '/requests?active_tab=all&page=1'

import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestList from "@/components/Request/RequestList";
import RequestListContext from "@/contexts/RequestListContext";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { RequestListProps } from "@/contexts/RequestListContext";
import {
  getRequestWithApproverList,
  getTeamRequestList,
} from "@/utils/queries-new";
import { Container, Tabs } from "@mantine/core";
import { useUser } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";

const filterRequestList = (
  requestList: RequestListProps["requestList"],
  queryParams: Record<string, string | string[] | undefined>,
  userId: string,
  approverList: RequestListProps["requestWithApproverList"]
) => {
  // http://localhost:3000/t/3bb6c9bf-d9e6-47a1-88d4-ca60917857eb/requests?active_tab=sent&page=1&form=1&status=approved&search_query=fe
  // Get all the query parameters from the URL.
  const { active_tab, form, status, search_query } = queryParams;

  let filteredRequestList = requestList;

  if (active_tab) {
    filteredRequestList = filteredRequestList.filter((request) => {
      if (active_tab === "sent") {
        return request.form_fact_user_id === userId;
      } else if (active_tab === "received") {
        return approverList[request.request_id || ""]?.find(
          (approver) => approver.approver_id === userId
        );
      } else {
        return true;
      }
    });
  }
  if (form) {
    filteredRequestList = filteredRequestList.filter(
      (request) => request.form_id === Number(form)
    );
  }
  if (status) {
    filteredRequestList = filteredRequestList.filter(
      (request) => request.form_fact_request_status_id === status
    );
  }
  if (search_query) {
    filteredRequestList = filteredRequestList.filter((request) => {
      const searchString = [
        request.user_first_name,
        request.user_last_name,
        request.username,
        request.request_title,
        request.request_description,
        request.request_on_behalf_of,
        request.request_id,
      ]
        .filter((e) => e)
        .join(" ")
        .toLowerCase();

      return searchString.includes(search_query.toString().toLowerCase());
    });
  }
  return filteredRequestList;
};

const RequestsPage: NextPageWithLayout<RequestListProps> = (props) => {
  const router = useRouter();
  const user = useUser();
  const [requestListProps, setRequestListProps] = useState(
    filterRequestList(
      props.requestList,
      router.query,
      user?.id as string,
      props.requestWithApproverList
    )
  );
  const [requestWithApproverListProps, setRequestWithApproverListProps] =
    useState(props.requestWithApproverList);

  useEffect(() => {
    if (!router.isReady) return;
    if (!user?.id) return;

    setRequestListProps(
      filterRequestList(
        props.requestList,
        router.query,
        user.id,
        props.requestWithApproverList
      )
    );
  }, [router.query]);

  return (
    <RequestListContext.Provider
      value={{
        requestList: requestListProps,
        requestWithApproverList: requestWithApproverListProps,
        setRequestList: setRequestListProps,
        setRequestWithApproverList: setRequestWithApproverListProps,
      }}
    >
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Container p={0} fluid>
        <Tabs
          value={router.query.active_tab as string}
          onTabChange={(value) =>
            router.push(
              {
                query: { ...router.query, active_tab: value, page: "1" },
              },
              undefined,
              { shallow: true }
            )
          }
        >
          <Tabs.List>
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Tab value="sent">Sent</Tabs.Tab>
            <Tabs.Tab value="received">Received</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Container fluid m={0} p={0}>
          <RequestList />
        </Container>
      </Container>
    </RequestListContext.Provider>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  const { tid: teamId } = ctx.query;

  const requestList = await getTeamRequestList(
    supabaseClient,
    teamId as string
  );
  const requestIdList = requestList.map((request) => request.request_id);
  const requestWithApproverList = await getRequestWithApproverList(
    supabaseClient,
    requestIdList as number[]
  );

  return {
    props: {
      requestList,
      requestWithApproverList,
    },
  };
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
