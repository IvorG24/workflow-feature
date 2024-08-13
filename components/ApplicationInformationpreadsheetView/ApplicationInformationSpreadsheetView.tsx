import {
  fetchRegion,
  getApplicationInformationSummaryData,
} from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import supabaseClientAddress from "@/utils/supabase/address";
import {
  ApplicationInformationFieldOptionType,
  ApplicationInformationFilterFormValues,
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  SupabaseClient,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { IconReload } from "@tabler/icons-react";
import { Database as OneOfficeDatabase } from "oneoffice-api";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import ApplicationInformationFilterMenu from "./ApplicationInformationFilterMenu";
import ApplicationInformationSpreadsheetTable from "./ApplicationInformationSpreadsheetTable/ApplicationInformationSpreadsheetTable";

const initialSort = {
  field: "request_date_created",
  order: "DESC",
  dataType: "DATE",
};

type Props = {
  sectionList: SectionWithFieldType[];
  optionList: ApplicationInformationFieldOptionType[];
};

const ApplicationInformationSpreadsheetView = ({
  sectionList,
  optionList: initialOptionList,
}: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [data, setData] = useState<ApplicationInformationSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [optionList, setOptionList] = useState(initialOptionList);
  const [isMax, setIsMax] = useState(false);

  const filterFormMethods = useForm<ApplicationInformationFilterFormValues>({
    defaultValues: {
      requestFilter: undefined,
      responseFilter: undefined,
    },
  });

  const fetchData = async (data?: ApplicationInformationFilterFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const filterData = filterFormMethods.getValues();
      const newData = await getApplicationInformationSummaryData(
        supabaseClient,
        {
          ...filterData,
          ...data,
          userId: user.id,
          limit: DEFAULT_NUMBER_SSOT_ROWS,
          page: data?.page ?? page,
          sort: data?.sort ?? sort,
        }
      );

      if (newData.length < DEFAULT_NUMBER_SSOT_ROWS) {
        setIsMax(true);
      }
      console.log("NEW DATA: ", newData);
      if (page === 1) {
        setData(newData);
      } else {
        setData((prev) => [...prev, ...newData]);
      }
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

  const handleReset = () => {
    filterFormMethods.reset();
    setPage(1);
    fetchData({ page: 1 });
  };

  useBeforeunload(() => {
    const filterData = filterFormMethods.getValues();
    localStorage.setItem(
      "applicationInformationSpreadsheetView",
      JSON.stringify({
        ...filterData,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page,
        sort,
      })
    );
  });

  useEffect(() => {
    const handleSorting = async () => {
      await fetchData({ sort });
    };
    handleSorting();
  }, [sort]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const regionData = await fetchRegion(
        supabaseClientAddress as unknown as SupabaseClient<
          OneOfficeDatabase["address_schema"]
        >
      );
      if (regionData) {
        setOptionList((prev) => {
          const regionOption = {
            field_name: "Region willing to be assigned",
            field_option: regionData.map((region, index) => {
              return {
                option_id: uuidv4(),
                option_value: region.region,
                option_order: index + 1,
                option_field_id: "aeb28a1f-8a5c-4e17-9ddd-a0377db12e97",
              };
            }),
          };
          return [...prev, regionOption];
        });
      }

      // const storedData = localStorage.getItem(
      //   "applicationInformationSpreadsheetView"
      // );
      // if (storedData) {
      //   const filterData: ApplicationInformationFilterFormValues =
      //     JSON.parse(storedData);

      //   setPage(filterData.page ?? 1);
      //   setSort(sort ?? initialSort);
      //   filterFormMethods.reset(filterData);
      //   await fetchData({
      //     ...filterData,
      //   });
      // } else {
      //   await fetchData({
      //     page: 1,
      //   });
      // }
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
            <ApplicationInformationFilterMenu
              fetchData={fetchData}
              optionList={optionList}
              handleReset={handleReset}
            />
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
        isMax={isMax}
      />
    </Stack>
  );
};

export default ApplicationInformationSpreadsheetView;
