import { getLRFSummaryData } from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import { LRFSpreadsheetData, OptionType } from "@/utils/types";
import { Box, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import ExportCSVButton from "./ExportCSVButton";
import LRFFilterMenu from "./LRFFilterMenu";
import LRFSpreadsheetTable from "./LRFSpreadsheetTable/LRFSpreadsheetTable";

type Props = {
  initialData: LRFSpreadsheetData[];
  projectListOptions: OptionType[];
};

const LRFSpreadsheetView = ({ initialData, projectListOptions }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);

  const fetchData = async ({
    currentPage,
    projectFilter,
  }: {
    currentPage: number;
    projectFilter?: string[];
  }) => {
    try {
      if (!user) return;
      setLoading(true);

      const { data: newData } = await getLRFSummaryData(supabaseClient, {
        userId: user.id,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page: currentPage,
        projectFilter: projectFilter,
      });

      return newData;
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterData = async (value: string[]) => {
    setProjectFilter(value);
    setPage(1);
    const newData = await fetchData({
      currentPage: 1,
      projectFilter: value ?? undefined,
    });

    if (!newData) throw Error;

    setData(newData);
  };

  const handlePagination = async (currentPage: number) => {
    setPage(currentPage);
    const newData = await fetchData({
      currentPage,
      projectFilter: projectFilter ?? undefined,
    });

    if (newData && newData.length > 0) {
      setPage(currentPage);
    }

    if (!newData) throw Error;

    setData((prev) => [...prev, ...newData]);
  };

  return (
    <Stack>
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Liquidation Spreadsheet View
          </Title>
          <LRFFilterMenu
            projectFilter={projectFilter}
            projectListOptions={projectListOptions}
            handleFilterData={handleFilterData}
          />
          {data.length > 0 && <ExportCSVButton data={data} />}
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
