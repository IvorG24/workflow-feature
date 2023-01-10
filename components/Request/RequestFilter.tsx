import { RequestStatus } from "@/utils/types-new";
import { ActionIcon, Select, SimpleGrid, TextInput } from "@mantine/core";
import SvgSearch from "../Icon/Search";

const statusOptions: {
  value: RequestStatus;
  label: string;
  group: string;
}[] = [
  { value: "pending", label: "Pending", group: "Status" },
  { value: "approved", label: "Approved", group: "Status" },
  { value: "rejected", label: "Rejected", group: "Status" },
  { value: "purchased", label: "Purchased", group: "Status" },
  { value: "stale", label: "Stale", group: "Status" },
];

const RequestFilter = () => {
  return (
    <SimpleGrid cols={3} mt="sm">
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
    </SimpleGrid>
  );
};

export default RequestFilter;
