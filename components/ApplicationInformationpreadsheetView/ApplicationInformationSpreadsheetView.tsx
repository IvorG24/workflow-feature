import { getApplicationInformationSummaryData } from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import {
  ApplicationInformationFilterFormValues,
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconReload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ApplicationInformationFilterMenu from "./ApplicationInformationFilterMenu";
import ApplicationInformationSpreadsheetTable from "./ApplicationInformationSpreadsheetTable/ApplicationInformationSpreadsheetTable";

type Props = {
  sectionList: SectionWithFieldType[];
};

const ApplicationInformationSpreadsheetView = ({ sectionList }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [data, setData] = useState<ApplicationInformationSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({
    field: "request_date_created",
    order: "DESC",
    dataType: "DATE",
  });

  const filterFormMethods = useForm<ApplicationInformationFilterFormValues>();

  const fetchData = async (data?: ApplicationInformationFilterFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const newData = await getApplicationInformationSummaryData(
        supabaseClient,
        {
          ...data,
          userId: user.id,
          limit: DEFAULT_NUMBER_SSOT_ROWS,
          page: data?.page ?? page,
          sort: data?.sort ?? sort,
        }
      );

      setData(newData);
    } catch (e) {
      console.log("ERROR: ", e);
      notifications.show({
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (currentPage: number) => {
    setPage(currentPage);
    await fetchData({
      page: currentPage,
    });
  };

  useEffect(() => {
    const handleSorting = async () => {
      await fetchData({ sort });
    };
    handleSorting();
  }, [sort]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchData({
        page: 1,
      });
    };
    fetchInitialData();
  }, [user]);

  return (
    <Stack pos="relative">
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Application Information Spreadsheet View
          </Title>

          <Button
            variant="light"
            leftIcon={<IconReload size={16} />}
            onClick={() => fetchData()}
          >
            Refresh
          </Button>
          <FormProvider {...filterFormMethods}>
            <ApplicationInformationFilterMenu fetchData={fetchData} />
          </FormProvider>
        </Group>
      </Box>
      <ApplicationInformationSpreadsheetTable
        data={data}
        sectionList={sectionList}
        isLoading={isLoading}
        page={page}
        handlePagination={handlePagination}
        sort={sort}
        setSort={setSort}
      />
    </Stack>
  );
};

export default ApplicationInformationSpreadsheetView;
