import { getLRFSummaryData } from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import { LRFSpreadsheetData, OptionType } from "@/utils/types";
import { ActionIcon, Box, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ExportCSVButton from "./ExportCSVButton";
import LRFFilterMenu from "./LRFFilterMenu";
import LRFSpreadsheetTable from "./LRFSpreadsheetTable/LRFSpreadsheetTable";

export type FilterFormValues = {
  requestIdFilter?: string;
  projectFilter: string[];
  dateFilter: [Date | null, Date | null];
};

type Props = {
  teamId: string;
  projectListOptions: OptionType[];
};

let isInitialized = false;

const LRFSpreadsheetView = ({ teamId, projectListOptions }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [data, setData] = useState<LRFSpreadsheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortAscending, setSortAscending] = useState(false);
  const [renderCsvDownload, setRenderCsvDownload] = useState(false);
  const filterFormMethods = useForm<FilterFormValues>();

  const fetchData = async ({
    currentPage,
    projectFilter = [],
    dateFilter = [null, null],
    sortFilter = sortAscending,
    requestIdFilter = undefined,
  }: {
    currentPage: number;
    projectFilter: string[];
    dateFilter: FilterFormValues["dateFilter"];
    sortFilter: boolean;
    requestIdFilter?: string;
  }) => {
    try {
      setLoading(true);

      const projectFilterCondition = projectFilter
        ? projectFilter.map((project) => `'${project}'`).join(",")
        : "";

      const startDate = dateFilter[0] ? moment(dateFilter[0]).format() : null;
      const endDate = dateFilter[1] ? moment(dateFilter[1]).format() : null;
      const response = await getLRFSummaryData(supabaseClient, {
        teamId,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page: currentPage,
        projectFilter: projectFilterCondition,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        sortFilter: sortFilter ? "ASC" : "DESC",
        requestIdFilter,
        projectListOptions,
      });

      return response.data;
    } catch (e) {
      notifications.show({
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterData = async (data: FilterFormValues) => {
    setPage(1);
    const newData = await fetchData({
      currentPage: 1,
      ...data,
      sortFilter: sortAscending,
    });
    if (!newData) throw Error;

    setData(newData);
  };

  const handleSortData = async () => {
    setSortAscending(!sortAscending);
    setPage(1);
    const currentFilters = filterFormMethods.getValues();
    const newData = await fetchData({
      currentPage: 1,
      ...currentFilters,
      sortFilter: !sortAscending,
    });

    if (!newData) throw Error;

    setData(newData);
  };

  const handlePagination = async (currentPage: number) => {
    setPage(currentPage);
    const currentFilters = filterFormMethods.getValues();

    const newData = await fetchData({
      currentPage,
      ...currentFilters,
      sortFilter: sortAscending,
    });

    if (newData && newData.length > 0) {
      setPage(currentPage);
    }
    if (!newData) throw Error;

    setData((prev) => [...prev, ...newData]);
  };

  useEffect(() => {
    if (window !== undefined) {
      setRenderCsvDownload(true);
    }

    if (!isInitialized) {
      handlePagination(1);
      isInitialized = true;
    }
  }, []);

  return (
    <Stack pos="relative">
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Liquidation Spreadsheet View
          </Title>
          <ActionIcon variant="filled" size="lg" onClick={handleSortData}>
            {sortAscending ? (
              <IconSortAscending size={24} />
            ) : (
              <IconSortDescending size={24} />
            )}
          </ActionIcon>
          <FormProvider {...filterFormMethods}>
            <LRFFilterMenu
              projectListOptions={projectListOptions}
              handleFilterData={handleFilterData}
            />
          </FormProvider>
          {renderCsvDownload && data.length > 0 && (
            <ExportCSVButton data={data} />
          )}
        </Group>
      </Box>
      <LRFSpreadsheetTable
        data={data}
        loading={loading}
        page={page}
        handlePagination={handlePagination}
      />
    </Stack>
  );
};

export default LRFSpreadsheetView;
