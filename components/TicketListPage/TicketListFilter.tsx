import { TeamMemberWithUserType, TicketCategoryTableRow } from "@/utils/types";
import {
  ActionIcon,
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
import { FilterFormValues, TicketListLocalFilter } from "./TicketListPage";

type Props = {
  // requestList: RequestType[];
  ticketCategoryList: TicketCategoryTableRow[];
  teamMemberList: TeamMemberWithUserType[];
  handleFilterTicketList: () => void;
  localFilter: TicketListLocalFilter;
  setLocalFilter: (
    val:
      | TicketListLocalFilter
      | ((prevState: TicketListLocalFilter) => TicketListLocalFilter)
  ) => void;
};

type FilterSelectedValuesType = {
  requesterList: string[];
  approverList: string[];
  categoryList: string[];
  status?: string[];
};

const TicketListFilter = ({
  localFilter,
  setLocalFilter,
  ticketCategoryList,
  teamMemberList,
  handleFilterTicketList,
}: Props) => {
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
  const { ref: categoryRef, focused: categoryRefFocused } = useFocusWithin();
  const { ref: statusRef, focused: statusRefFocused } = useFocusWithin();
  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>(localFilter);

  const memberList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const statusList = [
    { value: "PENDING", label: "Pending" },
    { value: "UNDER REVIEW", label: "Under Review" },
    { value: "INCORRECT", label: "Incorrect" },
    { value: "CLOSED", label: "Closed" },
  ];

  const categoryList = ticketCategoryList.map((category) => ({
    value: category.ticket_category_id,
    label: category.ticket_category,
  }));

  const { register, getValues, control, setValue } =
    useFormContext<FilterFormValues>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] | boolean = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];

    if (value !== filterMatch) {
      // if (value.length === 0 && filterMatch.length === 0) return;
      handleFilterTicketList();
      setLocalFilter({ ...localFilter, [key]: value });
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
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
    <Flex gap="sm" wrap="wrap">
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
                  handleFilterTicketList();
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
        placeholder="Search by ticket id"
        rightSection={
          <ActionIcon size="xs" type="submit">
            <IconSearch />
          </ActionIcon>
        }
        {...register("search")}
        sx={{ flex: 2 }}
        miw={250}
        maw={320}
      />

      <Controller
        control={control}
        name="categoryList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={categoryList}
            placeholder="Category"
            ref={categoryRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!categoryRefFocused)
                handleFilterChange("categoryList", value);
            }}
            onDropdownClose={() => handleFilterChange("categoryList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
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
          />
        )}
      />

      <Controller
        control={control}
        name="requesterList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            placeholder="Requester"
            ref={requestorRef}
            data={memberList}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!requestorRefFocused)
                handleFilterChange("requesterList", value);
            }}
            onDropdownClose={() => handleFilterChange("requesterList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={320}
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
          />
        )}
      />
    </Flex>
  );
};

export default TicketListFilter;
