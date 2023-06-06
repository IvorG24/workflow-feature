import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Group,
  MultiSelect,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FilterFormValues } from "./RequestListPage";

type RequestListFilterProps = {
  requestList: RequestType[];
  teamMemberList: TeamMemberWithUserType[];
  handleFilterForms: () => void;
};

type FilterSelectedValuesType = {
  formFilter: string[];
  statusFilter: string[];
  requestorFilter: string[];
};

const RequestListFilter = ({
  requestList,
  teamMemberList,
  handleFilterForms,
}: RequestListFilterProps) => {
  const inputFilterProps = {
    w: { base: 200, sm: 300 },
    clearable: true,
    clearSearchOnChange: true,
    clearSearchOnBlur: true,
    searchable: true,
    nothingFound: "Nothing found",
  };
  const { ref: requestorRef, focused: requestorRefFocused } = useFocusWithin();
  const { ref: formRef, focused: formRefFocused } = useFocusWithin();
  const { ref: statusRef, focused: statusRefFocused } = useFocusWithin();
  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      formFilter: [],
      statusFilter: [],
      requestorFilter: [],
    });

  const memberList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const initialFormList: { value: string; label: string }[] = [];
  const formList = requestList.reduce((uniqueForms, request) => {
    const formName = request.request_form.form_name;
    const uniqueFormNames = uniqueForms.map((form) => form.label);
    if (!uniqueFormNames.includes(formName)) {
      uniqueForms.push({
        value: request.request_form.form_id,
        label: formName,
      });
    }
    return uniqueForms;
  }, initialFormList);

  const statusList = [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELED", label: "Canceled" },
  ];

  const { register, getValues, control, setValue } =
    useFormContext<FilterFormValues>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[]
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];
    if (value !== filterMatch) {
      handleFilterForms();
    }
    setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
  };

  return (
    <Group>
      <Controller
        control={control}
        name="isAscendingSort"
        defaultValue={true}
        render={({ field: { value } }) => {
          return (
            <Tooltip
              label={getValues("isAscendingSort") ? "Ascending" : "Descending"}
              openDelay={800}
            >
              <ActionIcon
                onClick={async () => {
                  setValue("isAscendingSort", !getValues("isAscendingSort"));
                  handleFilterForms();
                }}
                size={36}
                color="dark.3"
                variant="outline"
              >
                {value ? (
                  <IconSortAscending size={18} />
                ) : (
                  <IconSortDescending size={18} />
                )}
              </ActionIcon>
            </Tooltip>
          );
        }}
      />
      <TextInput
        placeholder="Search by request id"
        rightSection={
          <ActionIcon size="xs" type="submit">
            <IconSearch />
          </ActionIcon>
        }
        w={{ base: 200, sm: 300 }}
        {...register("search")}
      />
      <Controller
        control={control}
        name="formList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={formList}
            placeholder="Form"
            ref={formRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!formRefFocused) handleFilterChange("formFilter", value);
            }}
            onDropdownClose={() => handleFilterChange("formFilter", value)}
            {...inputFilterProps}
          />
        )}
      />

      <Controller
        control={control}
        name="requestorList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            placeholder="Requestor"
            ref={requestorRef}
            data={memberList}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!requestorRefFocused)
                handleFilterChange("requestorFilter", value);
            }}
            onDropdownClose={() => handleFilterChange("requestorFilter", value)}
            {...inputFilterProps}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={statusList}
            placeholder="Status"
            ref={statusRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!statusRefFocused) handleFilterChange("statusFilter", value);
            }}
            onDropdownClose={() =>
              handleFilterChange("statusFilter", value as string[])
            }
            {...inputFilterProps}
          />
        )}
      />
    </Group>
  );
};

export default RequestListFilter;
