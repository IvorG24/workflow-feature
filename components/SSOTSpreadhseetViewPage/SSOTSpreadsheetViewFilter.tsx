import { ActionIcon, Flex, MultiSelect, TextInput } from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { SSOTFilterFormValues } from "./SSOTSpreadhseetViewPage";

type RequestListFilterProps = {
  projectNameList: string[];
  itemNameList: string[];
  handleFilterSSOT: () => void;
};

type FilterSelectedValuesType = {
  projectNameList: string[];
  itemNameList: string[];
};

const SSOTSpreadsheetViewFilter = ({
  projectNameList,
  itemNameList,
  handleFilterSSOT,
}: RequestListFilterProps) => {
  const inputFilterProps = {
    w: { base: 200, sm: 300 },
    clearable: true,
    clearSearchOnChange: true,
    clearSearchOnBlur: true,
    searchable: true,
    nothingFound: "Nothing found",
  };

  const { ref: projectNameRef, focused: projectNameRefFocused } =
    useFocusWithin();
  const { ref: itemRef, focused: itemRefFocused } = useFocusWithin();

  const projectNameListData = projectNameList.map((project) => ({
    label: project,
    value: project,
  }));

  const itemNameListData = itemNameList.map((item) => ({
    label: item,
    value: item,
  }));

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      projectNameList: [],
      itemNameList: [],
    });

  const { register, control } = useFormContext<SSOTFilterFormValues>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];
    if (value !== filterMatch) {
      if (value.length === 0 && filterMatch.length === 0) return;
      handleFilterSSOT();
    }
    setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
  };

  return (
    <Flex justify="flex-start" gap="md" wrap="wrap">
      <TextInput
        placeholder="Search by OTP ID"
        rightSection={
          <ActionIcon size="xs" type="submit">
            <IconSearch />
          </ActionIcon>
        }
        {...register("search")}
        sx={{ flex: 1 }}
        miw={250}
        maw={{ base: 500, xs: 300 }}
      />

      <Controller
        control={control}
        name="projectNameList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            data={projectNameListData}
            placeholder="Project Name"
            ref={projectNameRef}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!projectNameRefFocused)
                handleFilterChange("projectNameList", value);
            }}
            onDropdownClose={() => handleFilterChange("projectNameList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={{ base: 500, xs: 300 }}
          />
        )}
      />

      <Controller
        control={control}
        name="itemNameList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            placeholder="Item Name"
            ref={itemRef}
            data={itemNameListData}
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!itemRefFocused) handleFilterChange("itemNameList", value);
            }}
            onDropdownClose={() => handleFilterChange("itemNameList", value)}
            {...inputFilterProps}
            sx={{ flex: 1 }}
            miw={250}
            maw={{ base: 500, xs: 300 }}
          />
        )}
      />
    </Flex>
  );
};

export default SSOTSpreadsheetViewFilter;
