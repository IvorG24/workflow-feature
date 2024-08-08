import { getApplicationInformationSummaryData } from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import {
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import { Box, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import ApplicationInformationSpreadsheetTable from "./ApplicationInformationSpreadsheetTable/ApplicationInformationSpreadsheetTable";

type Props = {
  requestList: ApplicationInformationSpreadsheetData[];
  sectionList: SectionWithFieldType[];
};

export type FilterFormValues = {
  projectFilter: string[];
  dateFilter: [Date | null, Date | null];
};

const ApplicationInformationSpreadsheetView = ({
  requestList,
  sectionList,
}: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [data, setData] = useState(requestList);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = async ({ currentPage }: { currentPage: number }) => {
    try {
      if (!user) return;
      setLoading(true);

      const newData = await getApplicationInformationSummaryData(
        supabaseClient,
        {
          limit: DEFAULT_NUMBER_SSOT_ROWS,
          page: currentPage,
          userId: user.id,
        }
      );

      return newData;
    } catch (e) {
      notifications.show({
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePagination = async (currentPage: number) => {
    setPage(currentPage);
    const newData = await fetchData({
      currentPage,
    });

    if (newData && newData.length > 0) {
      setPage(currentPage);
    }
    if (!newData) throw Error;

    setData((prev) => [...prev, ...newData]);
  };

  return (
    <Stack pos="relative">
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Application Information Spreadsheet View
          </Title>
        </Group>
      </Box>
      <ApplicationInformationSpreadsheetTable
        data={data}
        sectionList={sectionList}
        loading={loading}
        page={page}
        handlePagination={handlePagination}
      />
    </Stack>
  );
};

export default ApplicationInformationSpreadsheetView;
