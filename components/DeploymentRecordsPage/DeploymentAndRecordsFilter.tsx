import {
  TeamMemberWithUserType,
  TechnicalAssessmentFilterValues,
} from "@/utils/types";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Group,
  TextInput,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconReload,
  IconSearch,
} from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormContext, UseFormSetValue } from "react-hook-form";

type RequestListFilterProps = {
  teamMemberList: TeamMemberWithUserType[];
  handleFilterForms: () => void;
  activePage: number;
  localFilter: TechnicalAssessmentFilterValues;
  setLocalFilter: Dispatch<SetStateAction<TechnicalAssessmentFilterValues>>;
  setShowTableColumnFilter: (value: SetStateAction<boolean>) => void;
  handlePagination: (page: number) => void;
  showTableColumnFilter: boolean;
  isFetchingRequestList: boolean;
  sortStatus: DataTableSortStatus;
  setSortStatus: Dispatch<SetStateAction<DataTableSortStatus>>;
  setValue: UseFormSetValue<TechnicalAssessmentFilterValues>;
};

const DeploymentAndRecordsFilter = ({
  handleFilterForms,
  localFilter,
  sortStatus,
  setSortStatus,
  handlePagination,
  activePage,
  isFetchingRequestList,
}: RequestListFilterProps) => {
  const { register, setValue, formState } =
    useFormContext<TechnicalAssessmentFilterValues>();

  useEffect(() => {
    Object.entries(localFilter).forEach(([key, value]) => {
      setValue(key as keyof TechnicalAssessmentFilterValues, value);
    });
  }, [localFilter]);

  useEffect(() => {
    setValue("isAscendingSort", sortStatus.direction === "asc");
    handlePagination(activePage);
  }, [sortStatus]);
  return (
    <>
      <Group position="apart">
        <Flex gap="sm" wrap="wrap" align="center" direction="row">
          <TextInput
            placeholder="Search by request id"
            rightSection={
              <ActionIcon
                disabled={formState.isSubmitting}
                size="xs"
                type="submit"
              >
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
            disabled={isFetchingRequestList}
          >
            Refresh
          </Button>
        </Flex>
        <Button
          variant="light"
          leftIcon={
            sortStatus.direction === "asc" ? (
              <IconArrowUp size={16} />
            ) : (
              <IconArrowDown size={16} />
            )
          }
          onClick={() => {
            const newDirection =
              sortStatus.direction === "asc" ? "desc" : "asc";
            setSortStatus({
              direction: newDirection,
              columnAccessor: sortStatus.columnAccessor,
            });
          }}
          disabled={isFetchingRequestList}
        >
          Sort By Request Date Created
        </Button>
      </Group>
      <Divider my="md" />
    </>
  );
};

export default DeploymentAndRecordsFilter;
