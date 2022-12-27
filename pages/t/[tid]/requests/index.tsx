// TODO: Redirect '/requests' to '/requests?active_tab=all&page=1'

import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import RequestList from "@/components/RequestsPage/RequestList";
import RequestListContext from "@/contexts/RequestListContext";
import {
  retrieveRequestFormByTeam,
  retrieveRequestList,
} from "@/utils/queries";
import { Container, Tabs, Title } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

import { RequestProps } from "@/contexts/RequestListContext";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const RequestsPage: NextPageWithLayout<RequestProps> = (props) => {
  const router = useRouter();

  // todo: fix meta tags
  return (
    <RequestListContext.Provider value={props}>
      <Meta description="List of all Requests" url="localhost:3000/requests" />
      <Container px={8} py={16} fluid>
        <Title>Requests</Title>

        <Tabs
          value={router.query.active_tab as string}
          onTabChange={(value) =>
            router.replace({
              query: { ...router.query, active_tab: value, page: "1" },
            })
          }
          mt={50}
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
  const supabase = createServerSupabaseClient(ctx);

  const {
    tid: teamId,
    page: activePage,
    form: form,
    search_query: searchQuery,
    active_tab,
    status,
  } = ctx.query;
  const request_per_page = 8;
  const start = (Number(activePage) - 1) * request_per_page;
  const selectedForm = form ? (form as string) : null;
  const formStatus = status ? status : "";
  const activeTab = active_tab !== "all" ? active_tab : false;

  const search = searchQuery === undefined ? "" : (searchQuery as string);
  const isSearch = searchQuery ? true : false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { requestList, requestCount } = await retrieveRequestList(
    supabase,
    start,
    `${teamId}`,
    request_per_page,
    selectedForm,
    formStatus as string,
    search,
    isSearch,
    activeTab as string,
    user?.id
  );
  const requestFormList = await retrieveRequestFormByTeam(
    supabase,
    `${teamId}`
  );
  const forms = requestFormList?.map((form) => {
    return { value: `${form.form_id}`, label: `${form.form_name}` };
  });

  return {
    props: {
      requestList,
      requestCount,
      forms,
    },
  };
};

RequestsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default RequestsPage;
