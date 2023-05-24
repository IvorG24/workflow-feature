import { RequestType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  MultiSelect,
  Pagination,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowsSort, IconSearch } from "@tabler/icons-react";
import { startCase } from "lodash";
import { useState } from "react";
import RequestCard from "./RequestCard/RequestCard";

type Props = {
  requestList: RequestType[];
};

const RequestListPage = ({ requestList }: Props) => {
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [sortByMostRecent, setSortByMostRecent] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const totalPages = Math.ceil(requestList.length / 12);

  const status = ["all", "pending", "approved", "cancelled", "rejected"];

  // get all requestor names
  const requestorList = requestList.reduce(
    (
      accumulator,
      {
        request_team_member: {
          team_member_user: { user_first_name, user_last_name },
        },
      }
    ) => {
      const name = `${user_first_name} ${user_last_name}`;
      if (!accumulator.includes(name)) {
        accumulator.push(name);
      }
      return accumulator;
    },
    [] as string[]
  );

  // get all form names
  const formList = requestList.reduce((uniqueForms, request) => {
    const formName = request.request_form.form_name;
    if (!uniqueForms.includes(formName)) {
      uniqueForms.push(formName);
    }
    return uniqueForms;
  }, [] as string[]);

  // get all request id
  const requestIdList = requestList.map((request) => request.request_id);

  const multiSelectData = [
    ...status.map((status) => ({
      value: status,
      label: startCase(status),
      group: "Status",
    })),
    ...requestorList.map((requestor) => ({
      value: requestor,
      label: startCase(requestor),
      group: "People",
    })),

    ...formList.map((form) => ({
      value: form,
      label: startCase(form),
      group: "Form",
    })),

    ...requestIdList.map((requestId) => ({
      value: requestId,
      label: requestId,
      group: "Request ID",
    })),
  ];

  const handleSearchFilter = (searchFilter: string[]) => {
    if (searchFilter.length === 0) {
      setVisibleRequestList(requestList);
      return;
    }

    const selectedStatus =
      searchFilter.includes("all") || searchFilter.length === 0
        ? status
        : searchFilter.filter((f) => status.includes(f.toLowerCase()));

    const selectedRequestor = searchFilter.filter((f) =>
      requestorList.includes(f)
    );

    const selectedRequestId = searchFilter.filter((f) =>
      requestIdList.includes(f)
    );

    const selectedForms = searchFilter.filter((f) => formList.includes(f));

    const filteredRequestList = visibleRequestList.filter((request) => {
      const { user_first_name, user_last_name } =
        request.request_team_member.team_member_user;

      const statusMatch =
        selectedStatus.length === 0 ||
        selectedStatus.includes(request.request_status.toLowerCase());

      const requesterMatch =
        selectedRequestor.length === 0 ||
        selectedRequestor.includes(`${user_first_name} ${user_last_name}`);

      const formMatch =
        selectedForms.length === 0 ||
        selectedForms.includes(startCase(request.request_form.form_name));

      const requestIdMatch =
        selectedRequestId.length === 0 ||
        selectedRequestId.includes(request.request_id);

      return statusMatch && requesterMatch && formMatch && requestIdMatch;
    });

    setVisibleRequestList(filteredRequestList);
  };

  const handleSortRequestList = () => {
    setSortByMostRecent(!sortByMostRecent);

    const sortedArray = visibleRequestList.sort((a, b) => {
      const dateA = new Date(a.request_date_created).getTime();
      const dateB = new Date(b.request_date_created).getTime();
      console.log(dateA, dateB);
      if (sortByMostRecent) {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    setVisibleRequestList(sortedArray);
  };

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
        <Button
          w={95}
          px={0}
          size="xs"
          variant="subtle"
          color="dark"
          leftIcon={<IconArrowsSort size={14} />}
          onClick={handleSortRequestList}
        >
          <Text size="sm">{sortByMostRecent ? "Recent" : "Oldest"}</Text>
        </Button>
        <MultiSelect
          maw={300}
          radius="xl"
          size="xs"
          placeholder="Search or filter requests"
          icon={<IconSearch size={14} />}
          data={multiSelectData}
          onChange={handleSearchFilter}
          nothingFound="Nothing found"
          searchable
        />
      </Group>
      <Space h="sm" />
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
      <Pagination
        mt="md"
        value={activePage}
        onChange={handlePagination}
        total={totalPages}
      />
    </Container>
  );
};

export default RequestListPage;
