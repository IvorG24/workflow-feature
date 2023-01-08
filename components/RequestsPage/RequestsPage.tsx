// todo: create unit tests for requests page and all of its sub components
import { Container, Tabs } from "@mantine/core";
import { useRouter } from "next/router";
import RequestList from "./RequestList";

const RequestListPage = () => {
  const router = useRouter();

  return (
    <Container px={8} py={16} fluid>
      {/* <Title>Requests</Title> */}

      <Tabs
        value={router.query.active_tab as string}
        onTabChange={(value) =>
          // router.replace({
          //   query: { ...router.query, active_tab: value, page: "1" },
          // })
          // Replace code above with code below to prevent page from reloading using shallow true router push.
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
  );
};

export default RequestListPage;
