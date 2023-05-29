import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import {
  Box,
  Container,
  Flex,
  Group,
  Pagination,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import RequestCard from "./RequestCard/RequestCard";
import RequestListFilter from "./RequestListFilter";

type Props = {
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const RequestListPage = ({ requestList, teamMemberList }: Props) => {
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [activePage, setActivePage] = useState(1);
  const totalPages = Math.ceil(requestList.length / 12);

  const handlePagination = () => {
    const itemsPerPage = 12;
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = visibleRequestList.slice(startIndex, endIndex);

    setVisibleRequestList(paginatedData);
    setActivePage((prev) => prev + 1);
  };

  return (
    <Container fluid>
      <Box mb="sm">
        <Title order={4}>Request List Page</Title>
        <Text>Manage your team requests here.</Text>
      </Box>
      <Group spacing={4}>
        <RequestListFilter
          requestList={requestList}
          teamMemberList={teamMemberList}
          setVisibleRequestList={setVisibleRequestList}
        />
      </Group>
      <Space h="sm" />
      {visibleRequestList.length > 0 ? (
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "flex-start" }}
          columnGap="md"
          rowGap="md"
          wrap="wrap"
        >
          {visibleRequestList.map((request) => (
            <RequestCard key={request.request_id} request={request} />
          ))}
        </Flex>
      ) : (
        <Text align="center" size={24} weight="bolder" color="dark.1">
          No request/s found
        </Text>
      )}
      <Pagination
        value={activePage}
        onChange={handlePagination}
        total={totalPages}
        mt="xl"
        position="right"
      />
    </Container>
  );
};

export default RequestListPage;
