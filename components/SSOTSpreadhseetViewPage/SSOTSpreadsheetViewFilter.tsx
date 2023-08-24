import { getSupplier } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  Box,
  Button,
  Drawer,
  Group,
  Loader,
  MultiSelect,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconFilter } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { SSOTFilterFormValues } from "./SSOTSpreadhseetViewPage";

type RequestListFilterProps = {
  requestingProjectList: string[];
  itemNameList: string[];
  handleFilterSSOT: () => void;
};

const SSOTSpreadsheetViewFilter = ({
  requestingProjectList,
  itemNameList,
  handleFilterSSOT,
}: RequestListFilterProps) => {
  const inputFilterProps = {
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

  const [showFilterModal, setShowFilterModal] = useState(false);
  const {
    reset,
    formState: { isDirty },
  } = useFormContext<SSOTFilterFormValues>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestingProjectListData = requestingProjectList.map((project) => ({
    label: project,
    value: project,
  }));

  const itemNameListData = itemNameList.map((item) => ({
    label: item,
    value: item,
  }));

  const { register, control, getValues } =
    useFormContext<SSOTFilterFormValues>();

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
    <Box>
      <Drawer
        opened={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={<Text weight={600}>Filter SSOT</Text>}
        position="right"
      >
        <Stack>
          <TextInput
            placeholder="Search by Project ID"
            {...register("search")}
          />

          <Controller
            control={control}
            name="requestingProjectList"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                data={requestingProjectListData}
                placeholder="Requesting Project"
                value={value}
                onChange={onChange}
                {...inputFilterProps}
              />
            )}
          />

          <Controller
            control={control}
            name="itemNameList"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Item Name"
                data={itemNameListData}
                value={value}
                onChange={onChange}
                {...inputFilterProps}
              />
            )}
          />

          <Controller
            control={control}
            name="supplierList"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Supplier"
                value={value}
                onChange={onChange}
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

          <Button
            color="red"
            variant="outline"
            disabled={!isDirty}
            onClick={() => {
              reset();
              handleFilterSSOT();
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              handleFilterSSOT();
              setShowFilterModal(false);
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Drawer>
      <Group position="center">
        <Button
          onClick={() => setShowFilterModal(true)}
          leftIcon={<IconFilter size={14} />}
        >
          Filters
        </Button>
      </Group>
    </Box>
  );
};

export default SSOTSpreadsheetViewFilter;
