import { useFormList } from "@/stores/useFormStore";
import { Drawer, Group, Stack, Switch, Text } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { Dispatch, SetStateAction } from "react";

type Props = {
  showTableColumnFilter: boolean;
  setShowTableColumnFilter: Dispatch<SetStateAction<boolean>>;
  requestListTableColumnFilter: string[];
  setRequestListTableColumnFilter: Dispatch<SetStateAction<string[]>>;
  selectedFormFilter: string[] | undefined;
};

const tableColumnList = [
  { value: "request_id", label: "Request ID" },
  { value: "request_jira_id", label: "Request Jira ID" },
  { value: "request_jira_status", label: "JIRA Status" },
  { value: "request_otp_id", label: "OTP ID" },
  { value: "request_form_name", label: "Form Name" },
  { value: "request_ped_equipment_number", label: "PED Equipment Number" },
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
  selectedFormFilter,
}: Props) => {
  const formList = useFormList();

  return (
    <Drawer
      opened={showTableColumnFilter}
      onClose={() => {
        setShowTableColumnFilter(false);
      }}
      position="right"
      title={
        <Text weight={600} fz={16}>
          Show/Hide Request List Table Columns
        </Text>
      }
    >
      <Stack px="sm">
        {tableColumnList.map((column, idx) => {
          const isHidden =
            requestListTableColumnFilter.find(
              (filter) => filter === column.value
            ) === undefined;

          const selectedForm = selectedFormFilter
            ? formList.find((form) => form.form_id === selectedFormFilter[0])
            : undefined;

          const showPedColumn = selectedForm?.form_name.includes("PED");
          const isPedColumn = column.label.includes("PED");

          if (isPedColumn && !showPedColumn) return null;

          return (
            <Group position="apart" key={column.value + idx}>
              <Text weight={500}>{column.label}</Text>
              <Switch
                checked={isHidden}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setRequestListTableColumnFilter((prev) =>
                      prev.filter((prevItem) => prevItem !== column.value)
                    );
                  } else {
                    setRequestListTableColumnFilter((prev) => [
                      ...prev,
                      column.value,
                    ]);
                  }
                }}
                styles={{ track: { cursor: "pointer" } }}
                color="green"
                onLabel={<IconEye size={16} />}
                offLabel={<IconEyeOff size={16} />}
              />
            </Group>
          );
        })}
      </Stack>
    </Drawer>
  );
};

export default RequestListTableColumnFilter;
