import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import { RequestStatus } from "@/utils/types-new";
import {
  ActionIcon,
  Select,
  SelectItem,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import SvgSearch from "../Icon/Search";
import ExportToCsv from "./ExportToCsv";

const statusOptions: {
  value: RequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "purchased", label: "Purchased" },
  { value: "cancelled", label: "Cancelled" },
  { value: "stale", label: "Stale" },
];

const RequestFilter = () => {
  const router = useRouter();
  const { formTemplateList } = useContext(ActiveTeamFormListContext);
  const formList = formTemplateList
    ? formTemplateList.map((form) => ({
        value: `${form.form_id}`,
        label: `${form.form_name}`,
      }))
    : [];
  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.form ? `${router.query.form}` : null
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(`${router.query.status}`);

  const handleFilterBySelectedForm = (selectedForm: string | null) => {
    setSelectedForm(selectedForm);
    setSearch("");
    if (selectedForm) {
      router.push(
        { query: { ...router.query, form: selectedForm, page: 1 } },
        undefined,
        { shallow: true }
      );
    } else {
      router.push(
        `/t/${router.query.tid}/requests?active_tab=all&page=${router.query.page}`,
        undefined,
        { shallow: true }
      );
    }
  };

  const handleSearch = (search: string) => {
    setSearch(search);
    router.push(
      {
        query: {
          ...router.query,
          search_query: search,
          page: 1,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  // !!! need to test if this will work on a mobile phone
  const handleSearchOnKeyUp = (e: {
    key: string;
    currentTarget: { value: string };
  }) => {
    const search = e.currentTarget.value;
    handleSearch(search);

    if (e.key === "Backspace" && search === "") {
      setSearch("");
      handleSearch(search);
    }
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatus(status as string);
    setSearch("");
    if (status) {
      router.push(
        { query: { ...router.query, status: status, page: 1 } },
        undefined,
        {
          shallow: true,
        }
      );
    } else {
      router.push(
        `/t/${router.query.tid}/requests?active_tab=${router.query.active_tab}&page=${router.query.page}`,
        undefined,
        { shallow: true }
      );
    }
  };

  return (
    <SimpleGrid
      cols={1}
      mt="sm"
      maw={600}
      breakpoints={[
        { minWidth: 768, cols: 4, spacing: "xs" },
        { minWidth: 320, cols: 1, spacing: "xs" },
      ]}
    >
      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Search"
        onKeyUp={handleSearchOnKeyUp}
        rightSection={
          <ActionIcon onClick={() => handleSearch(search)}>
            <SvgSearch />
          </ActionIcon>
        }
        size="xs"
      />
      <Select
        clearable
        placeholder="Form Type"
        data={formList as (string | SelectItem)[]}
        value={selectedForm}
        onChange={handleFilterBySelectedForm}
        size="xs"
      />
      <Select
        clearable
        placeholder="Status"
        data={statusOptions}
        value={status}
        onChange={handleFilterByStatus}
        data-cy="request-select-status"
        size="xs"
      />
      <ExportToCsv />
    </SimpleGrid>
  );
};

export default RequestFilter;
