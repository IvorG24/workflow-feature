import { RequestListFilterValues } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  MultiSelect,
  Switch,
  TextInput,
} from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { IconReload, IconSearch } from "@tabler/icons-react";
import { SetStateAction, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type RequestListFilterProps = {
  handleFilterForms: () => void;
  setShowTableColumnFilter: (value: SetStateAction<boolean>) => void;
  showTableColumnFilter: boolean;
};

type FilterSelectedValuesType = {
  status: string[];
};

const UserRequestListFilter = ({
  handleFilterForms,

  showTableColumnFilter,
  setShowTableColumnFilter,
}: RequestListFilterProps) => {
  const inputFilterProps = {
    w: { base: 200, sm: 300 },
    clearable: true,
    clearSearchOnChange: true,
    clearSearchOnBlur: true,
    searchable: true,
    nothingFound: "Nothing found",
  };
  const { ref: statusRef, focused: statusRefFocused } = useFocusWithin();

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      status: [],
    });
  const [isFilter, setIsfilter] = useState(false);

  const statusList = [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELED", label: "Canceled" },
  ];

  const { register, control } = useFormContext<RequestListFilterValues>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];

    if (value !== filterMatch) {
      // if (value.length === 0 && filterMatch.length === 0) return;
      handleFilterForms();
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
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
          <p>Show/Hide Table Columns</p>
          <Switch
            checked={showTableColumnFilter}
            onChange={(event) =>
              setShowTableColumnFilter(event.currentTarget.checked)
            }
            onLabel="ON"
            offLabel="OFF"
          />
        </Flex>

        <Flex gap="sm" wrap="wrap" align="center">
          <p>Filter</p>
          <Switch
            checked={isFilter}
            onChange={(event) => setIsfilter(event.currentTarget.checked)}
            onLabel="ON"
            offLabel="OFF"
          />
        </Flex>
      </Flex>
      <Divider my="md" />

      {isFilter && (
        <Flex gap="sm" wrap="wrap" mb="sm">
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
        </Flex>
      )}
    </>
  );
};

export default UserRequestListFilter;
