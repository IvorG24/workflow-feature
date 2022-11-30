import { Search } from "@/components/Icon";
import { ActionIcon, Group, Select, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import RequestTable from "./RequestTable";

const tempFormType = [
  { value: "approvalRequest", label: "Approval Request" },
  { value: "it", label: "IT" },
  { value: "purchaseOrder", label: "Purchase Order" },
  { value: "ptrf", label: "PTRF" },
  { value: "requisitionForm", label: "Requisition Form" },
  { value: "requestforPayment", label: "Request for Payment" },
  { value: "releaseOrder", label: "Release Order" },
];

const tempStatus = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "forRevision", label: "For Revision" },
  { value: "stale", label: "Stale" },
  { value: "cancelled", label: "Cancelled" },
];

const Sent = () => {
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <Stack>
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon>
              <Search />
            </ActionIcon>
          }
        />
        <Select
          clearable
          placeholder="Form Type"
          data={tempFormType}
          value={formType}
          onChange={setFormType}
        />
        <Select
          clearable
          placeholder="Status"
          data={tempStatus}
          value={status}
          onChange={setStatus}
        />
      </Group>
      <RequestTable formType={formType} status={status} search={search} />
    </Stack>
  );
};

export default Sent;
