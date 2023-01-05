import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import RequestListContext from "@/contexts/RequestListContext";
import { RequestStatus } from "@/utils/types-new";
import {
  ActionIcon,
  Group,
  Pagination,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from "@mantine/core";
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import SvgSearch from "../Icon/Search";
import RequestTable from "./RequestTable";

const statusOptions: {
  value: RequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "purchased", label: "Purchased" },
  { value: "stale", label: "Stale" },
];

const REQUEST_PER_PAGE = 8;

const RequestList = () => {
  const router = useRouter();
  const requestListContext = useContext(RequestListContext);
  const { requestListCount } = requestListContext || {};

  const activeTeamFormList = useContext(ActiveTeamFormListContext);
  const formList = activeTeamFormList?.map((form) => ({
    value: `${form.form_id}`,
    label: `${form.form_name}`,
  }));

  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string | null>(`${router.query.status}`);
  const [activePage, setActivePage] = useState(1);

  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.form ? `${router.query.form}` : null
  );

  const handleSearch = useCallback(
    (search: string) => {
      setSearch(search);
      router.push({ query: { ...router.query, search_query: search } });
    },
    [router]
  );

  // !!! need to test if this will work on a mobile phone
  const handleSearchOnKeyUp = (e: {
    key: string;
    currentTarget: { value: string };
  }) => {
    const search = e.currentTarget.value;

    if (e.key === "Enter") {
      handleSearch(search);
    }
    if (e.key === "Backspace" && search === "") {
      setSearch("");
      handleSearch(search);
    }
  };

  const handleFilterBySelectedForm = useCallback(
    (selectedForm: string | null) => {
      setSelectedForm(selectedForm);
      if (selectedForm) {
        router.push({ query: { ...router.query, form: selectedForm } });
      } else {
        router.push(
          `/t/${router.query.tid}/requests?active_tab=all&page=${activePage}`
        );
      }
    },
    [router, activePage]
  );

  const handleFilterByStatus = useCallback(
    (status: string | null) => {
      setStatus(status);
      if (status) {
        router.push({ query: { ...router.query, status: status } });
      } else {
        router.push(
          `/t/${router.query.tid}/requests?active_tab=${router.query.active_tab}&page=${activePage}`
        );
      }
    },
    [router, activePage]
  );

  const handlePagination = (activePage: number) => {
    setActivePage(activePage);
    router.replace({ query: { ...router.query, page: activePage } });
  };

  const handlePagination = (activePage: number) => {
    setActivePage(activePage);
    router.replace({ query: { ...router.query, page: activePage } });
  };

  // reset filters when team_id changes
  // useEffect(() => {
  //   setSearch("");
  //   setSelectedForm(null);
  //   setStatus(null);
  // }, [router.query.tid]);
  // todo: add eslint to show error for `mt={"xl"}`
  return (
    <Stack>
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon onClick={() => handleSearch(search)}>
              <SvgSearch />
            </ActionIcon>
          }
          onKeyUp={handleSearchOnKeyUp}
        />
        <Select
          clearable
          placeholder="Form Type"
          data={formList as (string | SelectItem)[]}
          value={selectedForm}
          onChange={handleFilterBySelectedForm}
        />
        <Select
          clearable
          placeholder="Status"
          data={statusOptions}
          value={status}
          onChange={handleFilterByStatus}
          data-cy="request-select-status"
        />
      </Group>
      <RequestTable />

      {ceil((requestListCount as number) / REQUEST_PER_PAGE) >= 1 ? (
        <Pagination
          sx={{ alignSelf: "flex-end" }}
          page={activePage}
          onChange={handlePagination}
          total={ceil((requestListCount as number) / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};

export default RequestList;
