import { getSupplier } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  ActionIcon,
  Flex,
  Loader,
  MultiSelect,
  TextInput,
} from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { SSOTFilterFormValues } from "./SSOTSpreadsheetViewPage";

type RequestListFilterProps = {
  projectNameList: string[];
  itemNameList: string[];
  handleFilterSSOT: () => void;
};

type FilterSelectedValuesType = {
  projectNameList: string[];
  itemNameList: string[];
  supplierList: string[];
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
  const supabaseClient = createPagesBrowserClient<Database>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const team = useActiveTeam();
  const [isSearching, setIsSearching] = useState(false);
  const [supplierKeyword, setSupplierKeyword] = useState("");
  const [supplierOptions, setSupplierOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const { ref: projectNameRef, focused: projectNameRefFocused } =
    useFocusWithin();
  const { ref: itemRef, focused: itemRefFocused } = useFocusWithin();
  const { ref: supplierRef, focused: supplierRefFocused } = useFocusWithin();

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
      supplierList: [],
    });

  const { register, control, getValues } =
    useFormContext<SSOTFilterFormValues>();

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

  const supplierSearch = async (value: string) => {
    if (!value || value === supplierKeyword) return;

    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value,
        teamId: team.team_id,
        fieldId: "",
      });
      const options = supplierList.map((supplier) => {
        return {
          label: supplier.option_value,
          value: supplier.option_value,
        };
      });
      const keywords = getValues("supplierList");
      if (keywords) {
        keywords.forEach((supplier) => {
          options.push({
            label: supplier,
            value: supplier,
          });
        });
      }
      setSupplierOptions(options);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Flex justify="flex-start" gap="md" wrap="wrap">
      <TextInput
        placeholder="Search by Requisition ID"
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

      <Controller
        control={control}
        name="supplierList"
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            ref={supplierRef}
            placeholder="Supplier"
            value={value}
            onChange={(value) => {
              onChange(value);
              if (!supplierRefFocused)
                handleFilterChange("supplierList", value);
            }}
            onDropdownClose={() => handleFilterChange("supplierList", value)}
            data={supplierOptions}
            {...inputFilterProps}
            onSearchChange={(value) => {
              setSupplierKeyword(value);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => {
                supplierSearch(value);
              }, 500);
            }}
            rightSection={isSearching ? <Loader size={16} /> : null}
            nothingFound="Nothing found. Try a different keyword"
          />
        )}
      />
    </Flex>
  );
};

export default SSOTSpreadsheetViewFilter;
