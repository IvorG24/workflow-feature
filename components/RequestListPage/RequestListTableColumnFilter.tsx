import { Button, Modal, MultiSelect, Stack } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";

type Props = {
  showTableColumnFilter: boolean;
  setShowTableColumnFilter: Dispatch<SetStateAction<boolean>>;
  requestListTableColumnFilter: string[];
  setRequestListTableColumnFilter: Dispatch<SetStateAction<string[]>>;
};

const tableColumnList = [
  { value: "request_id", label: "Request ID" },
  { value: "request_jira_id", label: "Request Jira ID" },
  { value: "request_jira_status", label: "JIRA Status" },
  { value: "request_otp_id", label: "OTP ID" },
  { value: "request_form_name", label: "Form Name" },
  { value: "request_status", label: "Status" },
  { value: "request_team_member_id", label: "Requested By" },
  { value: "request_signer", label: "Approver" },
  { value: "request_date_created", label: "Date Created" },
  { value: "view", label: "View" },
];

const RequestListTableColumnFilter = ({
  showTableColumnFilter,
  setShowTableColumnFilter,
  requestListTableColumnFilter,
  setRequestListTableColumnFilter,
}: Props) => {
  return (
    <Modal
      opened={showTableColumnFilter}
      onClose={() => {
        setShowTableColumnFilter(false);
      }}
      title="Select columns you want to hide."
      centered
    >
      <Stack>
        <MultiSelect
          label="Hidden Columns"
          data={tableColumnList}
          withinPortal={true}
          value={requestListTableColumnFilter}
          onChange={setRequestListTableColumnFilter}
        />
        <Button fullWidth onClick={() => setShowTableColumnFilter(false)}>
          Done
        </Button>
      </Stack>
    </Modal>
  );
};

export default RequestListTableColumnFilter;
