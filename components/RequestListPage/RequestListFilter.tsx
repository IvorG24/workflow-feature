import { TeamMemberWithUserType, TeamProjectTableRow } from "@/utils/types";
import {
  ActionIcon,
  Checkbox,
  Flex,
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
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FilterFormValues, RequestListLocalFilter } from "./RequestListPage";

type RequestListFilterProps = {
  // requestList: RequestType[];
  formList: { label: string; value: string }[];
  teamMemberList: TeamMemberWithUserType[];
  handleFilterForms: () => void;
  localFilter: RequestListLocalFilter;
  setLocalFilter: (
    val:
      | RequestListLocalFilter
      | ((prevState: RequestListLocalFilter) => RequestListLocalFilter)
  ) => void;
  projectList: TeamProjectTableRow[];
};

type FilterSelectedValuesType = {
  formList: string[];
  status: string[];
  requestorList: string[];
  approverList: string[];
  projectList: string[];
  idFilterList: string[];
  isApproversView: boolean;
};

const RequestListFilter = ({
  // requestList,
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
      formList: [],
      status: [],
      requestorList: [],
      approverList: [],
      projectList: [],
      idFilterList: [],
      isApproversView: false,
    });

  const memberList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  // const initialFormList: { value: string; label: string }[] = [];
  // const formList = requestList.reduce((uniqueForms, request) => {
  //   const formName = request.request_form.form_name;
  //   const uniqueFormNames = uniqueForms.map((form) => form.label);
  //   if (!uniqueFormNames.includes(formName)) {
  //     uniqueForms.push({
  //       value: request.request_form.form_id,
  //       label: formName,
  //     });
  //   }
  //   return uniqueForms;
  // }, initialFormList);

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

  const { register, getValues, control, setValue } =
    useFormContext<FilterFormValues>();

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

  useEffect(() => {
    // assign values to filter form localstorage
    Object.entries(localFilter).forEach(([key, value]) => {
      setValue(key as keyof FilterFormValues, value);
    });
    setFilterSelectedValues(localFilter as unknown as FilterSelectedValuesType);
  }, [localFilter, setValue]);

  return (
    <Flex gap="sm" wrap="wrap" align="center" direction="row">
      <Controller
        control={control}
        name="isAscendingSort"
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
                className="onboarding-request-list-sort"
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
        {...register("search")}
        sx={{ flex: 2 }}
        miw={250}
        maw={320}
        disabled={filterSelectedValues.isApproversView}
        className="onboarding-request-list-filters-rid"
      />

      <Controller
        control={control}
        name="formList"
        defaultValue={localFilter.formList}
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={formList}
            placeholder="Form"
            ref={formRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!formRefFocused) handleFilterChange("formList", value);
            }}
            onDropdownClose={() => handleFilterChange("formList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
            disabled={filterSelectedValues.isApproversView}
            className="onboarding-request-list-filters-form"
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
            className="onboarding-request-list-filters-status"
          />
        )}
      />

      <Controller
        control={control}
        name="projectList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={projectListChoices}
            placeholder="Project"
            ref={projectRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!projectRefFocused) handleFilterChange("projectList", value);
            }}
            onDropdownClose={() =>
              handleFilterChange("projectList", value as string[])
            }
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
            disabled={filterSelectedValues.isApproversView}
            className="onboarding-request-list-filters-project"
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
                handleFilterChange("requestorList", value);
            }}
            onDropdownClose={() => handleFilterChange("requestorList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
            disabled={filterSelectedValues.isApproversView}
            className="onboarding-request-list-filters-requestor"
          />
        )}
      />

      <Controller
        control={control}
        name="approverList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            placeholder="Approver"
            ref={approverRef}
            data={memberList}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!approverRefFocused)
                handleFilterChange("approverList", value);
            }}
            onDropdownClose={() => handleFilterChange("approverList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
            disabled={filterSelectedValues.isApproversView}
            className="onboarding-request-list-filters-approver"
          />
        )}
      />

      <Controller
        control={control}
        name="idFilterList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            placeholder="OTP and Jira ID"
            ref={idFilterRef}
            data={idFilterList}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!idFilterRefFocused)
                handleFilterChange("idFilterList", value);
            }}
            onDropdownClose={() => handleFilterChange("idFilterList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
            disabled={filterSelectedValues.isApproversView}
            className="onboarding-request-list-filters-id-filter"
          />
        )}
      />

      <Tooltip label="Filter all your pending requests.">
        <Checkbox
          label="Approver's View"
          {...register("isApproversView")}
          onChange={(e) => {
            setValue("isApproversView", e.target.checked);
            handleFilterChange("isApproversView", e.target.checked);
          }}
          sx={{
            label: {
              cursor: "pointer",
            },
            input: {
              cursor: "pointer",
            },
          }}
          className="onboarding-request-list-filters-approver-view"
        />
      </Tooltip>
    </Flex>
  );
};

export default RequestListFilter;
