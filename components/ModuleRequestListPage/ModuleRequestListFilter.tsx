import { TeamMemberWithUserType, TeamProjectTableRow } from "@/utils/types";
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
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

type RequestListFilterProps = {
  formList: { label: string; value: string }[];
  teamMemberList: TeamMemberWithUserType[];
  handleFilterForms: () => void;
  localFilter: FilterSelectedValuesType;
  setLocalFilter: Dispatch<SetStateAction<FilterSelectedValuesType>>;
  projectList: TeamProjectTableRow[];
  setShowTableColumnFilter: (value: SetStateAction<boolean>) => void;
  groupOptions: { label: string; value: string }[];
  showTableColumnFilter: boolean;
};

type FilterSelectedValuesType = {
  form: string[];
  requestor: string[];
  approver: string[];
  search: string;
  isAscendingSort: boolean;
  isApprover: boolean;
};

const ModuleRequestListFilter = ({
  formList,
  handleFilterForms,
  localFilter,
  groupOptions,
  setLocalFilter,
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
  const { ref: requestorRef, focused: requestorRefFocused } = useFocusWithin();
  const { ref: approverRef, focused: approverRefFocused } = useFocusWithin();
  const { ref: formRef, focused: formRefFocused } = useFocusWithin();

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      form: [],
      requestor: [],
      approver: [],
      search: "",
      isAscendingSort: false,
      isApprover: false,
    });
  const [isFilter, setIsfilter] = useState(false);

  const requestByOptions = [
    {
      label: "Admin",
      value: "ADMIN",
    },
    { label: "Owner", value: "OWNER" },
  ];
  const { register, control, setValue, watch } =
    useFormContext<FilterSelectedValuesType>();

  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] | boolean = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];

    if (value !== filterMatch) {
      handleFilterForms();
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
      setLocalFilter({ ...localFilter, [key]: value });
    }
  };

  return (
    <>
      <Flex gap="sm" wrap="wrap" align="center" direction="row">
        <TextInput
          placeholder="Search Module Request ID"
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
            onLabel={"ON"}
            offLabel={"OFF"}
            checked={showTableColumnFilter}
            onChange={(event) =>
              setShowTableColumnFilter(event.currentTarget.checked)
            }
          />
        </Flex>

        <Flex gap="sm" wrap="wrap" align="center">
          <p>Filter</p>
          <Switch
            onLabel={"ON"}
            offLabel={"OFF"}
            checked={isFilter}
            onChange={(event) => setIsfilter(event.currentTarget.checked)}
          />
        </Flex>

        <Flex gap="sm" wrap="wrap" align="center">
          <p>Approvers View</p>
          <Switch
            {...register("isApprover")}
            onLabel={"ON"}
            offLabel={"OFF"}
            checked={watch("isApprover")}
            onChange={(event) => {
              setValue("isApprover", event.currentTarget.checked);
              handleFilterForms();
            }}
          />
        </Flex>
      </Flex>
      <Divider my="md" />

      {isFilter && (
        <Flex gap="sm" wrap="wrap" mb="sm">
          <Controller
            control={control}
            name="form"
            defaultValue={localFilter.form}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                data={formList}
                placeholder="Form Name"
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
              />
            )}
          />

          <Controller
            control={control}
            name="requestor"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Requested by"
                ref={requestorRef}
                data={requestByOptions}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!requestorRefFocused)
                    handleFilterChange("requestor", value);
                }}
                onDropdownClose={() => handleFilterChange("requestor", value)}
                {...inputFilterProps}
                sx={{ flex: 1 }}
                miw={250}
                maw={320}
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
                data={groupOptions}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (!approverRefFocused)
                    handleFilterChange("approver", value);
                }}
                onDropdownClose={() => handleFilterChange("approver", value)}
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

export default ModuleRequestListFilter;
