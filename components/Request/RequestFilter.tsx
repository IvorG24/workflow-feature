import { RequestStatus } from "@/utils/types-new";
import { ActionIcon, Select, SimpleGrid, TextInput } from "@mantine/core";
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
  { value: "stale", label: "Stale" },
];

const RequestFilter = () => {
  return (
    <SimpleGrid cols={4} mt="sm" maw={600}>
      <TextInput
        //   value={search}
        //   onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Search"
        rightSection={
          // add -> onClick={() => handleSearch(search)}
          <ActionIcon>
            <SvgSearch />
          </ActionIcon>
        }
        //   onKeyUp={handleSearchOnKeyUp}
      />
      <Select
        clearable
        placeholder="Form Type"
        data={[]}
        //   value={selectedForm}
        //   onChange={handleFilterBySelectedForm}
      />
      <Select
        clearable
        placeholder="Status"
        data={statusOptions}
        //   value={status}
        //   onChange={handleFilterByStatus}
        data-cy="request-select-status"
      />
      <ExportToCsv />
    </SimpleGrid>
  );
};

export default RequestFilter;
