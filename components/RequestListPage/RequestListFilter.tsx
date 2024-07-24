import {
  RequestListFilterValues,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  MultiSelect,
  Switch,
  TextInput
} from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import {
  IconEyeFilled,
  IconReload,
  IconSearch
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type RequestListFilterProps = {
  formList: { label: string; value: string }[];
  teamMemberList: TeamMemberWithUserType[];
  handleFilterForms: () => void;
  localFilter: RequestListFilterValues;
  setLocalFilter: Dispatch<SetStateAction<RequestListFilterValues>>;
  projectList: TeamProjectTableRow[];
};

type FilterSelectedValuesType = {
  form: string[];
  status: string[];
  requestor: string[];
  approver: string[];
  project: string[];
  idFilter: string[];
  isApproversView: boolean;
};

const RequestListFilter = ({
  formList,
  teamMemberList,
  handleFilterForms,
  localFilter,
  setLocalFilter,
  projectList,
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
  const { ref: approverRef, focused: approverRefFocused } = useFocusWithin();
  const { ref: formRef, focused: formRefFocused } = useFocusWithin();
  const { ref: statusRef, focused: statusRefFocused } = useFocusWithin();
  const { ref: projectRef, focused: projectRefFocused } = useFocusWithin();
  const { ref: idFilterRef, focused: idFilterRefFocused } = useFocusWithin();

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      form: [],
      status: [],
      requestor: [],
      approver: [],
      project: [],
      idFilter: [],
      isApproversView: false,
    });
    const [isFilter, setIsfilter] = useState(false);

  const memberList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const statusList = [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELED", label: "Canceled" },
  ];

  const idFilterList = [
    { value: "otp", label: "No OTP ID" },
    { value: "jira", label: "No JIRA ID" },
  ];

  const projectListChoices = projectList.map((project) => {
    return {
      label: project.team_project_name,
      value: project.team_project_code,
    };
  });

  const { register, control, setValue } =
    useFormContext<RequestListFilterValues>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] | boolean = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];

    if (value !== filterMatch) {
      // if (value.length === 0 && filterMatch.length === 0) return;
      handleFilterForms();
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
      setLocalFilter({ ...localFilter, [key]: value });
    }
  };

  return (
    <>
      <Flex gap="sm" wrap="wrap" align="center" direction="row">
      <TextInput
        placeholder="Search by request id"
        rightSection={
          <ActionIcon size="xs" type="submit">
            <IconSearch />
          </ActionIcon>
        }
        {...register("search")}
        sx={{ flex: 2 }}
        miw={250}
        maw={320}
        disabled={filterSelectedValues.isApproversView}
      />
      <Button
          variant="light"
          leftIcon={<IconReload size={16} />}
          onClick={() => {
            handleFilterForms();
          }}
        >
          Refresh
      </Button>

      <Flex gap="sm" wrap="wrap" align="center">
          <p>Filter</p>
          <Switch
            onLabel={<IconEyeFilled size="14" />}
            checked={isFilter}
            onChange={(event) => setIsfilter(event.currentTarget.checked)}
          />
      </Flex>
      <Flex gap="sm" wrap="wrap" align="center">
          <p>Approver&apos;s View</p>
          <Switch
            onLabel={<IconEyeFilled size="14" />}
            {...register("isApproversView")}
            onChange={(e) => {
              setValue("isApproversView", e.target.checked);
              handleFilterChange("isApproversView", e.target.checked);
            }}
          />
      </Flex>
    </Flex>
    <Divider my="md" />

    {isFilter && 
      <Flex gap="sm" wrap="wrap" mb="sm">
        <Controller
            control={control}
            name="form"
            defaultValue={localFilter.form}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                data={formList}
                placeholder="Form"
                ref={formRef}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!formRefFocused) handleFilterChange("form", value);
                }}
                onDropdownClose={() => handleFilterChange("form", value)}
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
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
                  if (!statusRefFocused) handleFilterChange("status", value);
                }}
                onDropdownClose={() =>
                  handleFilterChange("status", value as string[])
                }
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
              />
            )}
          />

          <Controller
            control={control}
            name="project"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                data={projectListChoices}
                placeholder="Project"
                ref={projectRef}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!projectRefFocused) handleFilterChange("project", value);
                }}
                onDropdownClose={() =>
                  handleFilterChange("project", value as string[])
                }
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
              />
            )}
          />

          <Controller
            control={control}
            name="requestor"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Requestor"
                ref={requestorRef}
                data={memberList}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!requestorRefFocused) handleFilterChange("requestor", value);
                }}
                onDropdownClose={() => handleFilterChange("requestor", value)}
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
              />
            )}
          />

          <Controller
            control={control}
            name="approver"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Approver"
                ref={approverRef}
                data={memberList}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!approverRefFocused) handleFilterChange("approver", value);
                }}
                onDropdownClose={() => handleFilterChange("approver", value)}
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
              />
            )}
          />

          <Controller
            control={control}
            name="idFilter"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="OTP and Jira ID"
                ref={idFilterRef}
                data={idFilterList}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!idFilterRefFocused) handleFilterChange("idFilter", value);
                }}
                onDropdownClose={() => handleFilterChange("idFilter", value)}
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
                disabled={filterSelectedValues.isApproversView}
              />
            )}
          />
      </Flex>
    }
    
    </>
    
  );
};

export default RequestListFilter;
