import { getHRScreeningSummaryData } from "@/backend/api/get";
import { updateHRScreeningStatus } from "@/backend/api/update";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import {
  HRScreeningFilterFormValues,
  HRScreeningSpreadsheetData,
  OptionType,
} from "@/utils/types";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconReload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useForm } from "react-hook-form";
import ApplicationInformationColumnsMenu from "./HRScreeningColumnsMenu";
import HRScreeningFilterMenu from "./HRScreeningFilterMenu";
import HRScreeningSpreadsheetTable from "./HRScreeningSpreadsheetTable/HRScreeningSpreadsheetTable";

const initialSort = {
  sortBy: "onlineAssessment.request_date_created",
  order: "DESC",
};

const formDefaultValues = {
  position: "",
  application_information_request_id: "",
  online_application_request_id: "",
  online_application_score: {
    start: null,
    end: null,
  },
  online_assessment_request_id: "",
  online_assessment_score: {
    start: null,
    end: null,
  },
  online_assessment_date: {
    start: "",
    end: "",
  },
  hr_screening_status: "",
};

type Props = {
  positionOptionList: OptionType[];
};

const HRScreeningSpreadsheetView = ({ positionOptionList }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const teamMember = useUserTeamMember();
  const [data, setData] = useState<HRScreeningSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [isMax, setIsMax] = useState(false);
  const [hiddenColumnList, setHiddenColumnList] = useLocalStorage<string[]>({
    key: "HRScreeningColumns",
    defaultValue: [],
  });

  const filterFormMethods = useForm<HRScreeningFilterFormValues>({
    defaultValues: formDefaultValues as unknown as HRScreeningFilterFormValues,
  });

  const fetchData = async (data?: HRScreeningFilterFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      setIsMax(false);

      const filterData = filterFormMethods.getValues();

      const newData = await getHRScreeningSummaryData(supabaseClient, {
        ...filterData,
        ...data,
        userId: user.id,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page: data?.page ?? page,
        sort: data?.sort ?? sort,
      });

      if (newData.length < DEFAULT_NUMBER_SSOT_ROWS) {
        setIsMax(true);
      }

      if ((data?.page ?? page) === 1) {
        setData(newData);
      } else {
        setData((prev) => [...prev, ...newData]);
      }
    } catch (e) {
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
    filterFormMethods.reset(
      formDefaultValues as unknown as HRScreeningFilterFormValues
    );
    setPage(1);
    fetchData({ page: 1 });
  };

  useBeforeunload(() => {
    const filterData = filterFormMethods.getValues();
    localStorage.setItem(
      "hrScreeningSpreadsheetView",
      JSON.stringify({
        ...filterData,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        sort,
      })
    );
  });

  useEffect(() => {
    const handleSorting = async () => {
      await fetchData({ sort, page: 1 });
    };
    handleSorting();
  }, [sort]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchData({
        page: 1,
      });
      const storedData = localStorage.getItem("hrScreeningSpreadsheetView");
      if (storedData) {
        const filterData: HRScreeningFilterFormValues = JSON.parse(storedData);
        setSort(filterData.sort ?? initialSort);
        filterFormMethods.reset(filterData as HRScreeningFilterFormValues);
        await fetchData({
          ...filterData,
        });
      } else {
        await fetchData({
          page: 1,
        });
      }
    };
    fetchInitialData();
  }, [user?.id]);

  const handleUpdateHRScreeningStatus = async (
    applicationinformationRqeuestId: string,
    status: string
  ) => {
    setIsLoading(true);
    try {
      if (!teamMember?.team_member_id) throw new Error();

      await updateHRScreeningStatus(supabaseClient, {
        applicationinformationRqeuestId,
        status,
        teamMemberId: teamMember.team_member_id,
      });
      setData((prev) =>
        prev.map((data) => {
          if (data.hr_request_reference_id !== applicationinformationRqeuestId)
            return data;

          return {
            ...data,
            hr_screening_status: status,
          };
        })
      );
      notifications.show({
        message: `HR screening ${status.toLowerCase()}.`,
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack pos="relative">
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            HR Screening Spreadsheet View
          </Title>
          <Button
            leftIcon={<IconReload size={16} />}
            onClick={() => fetchData()}
          >
            Refresh
          </Button>
          <FormProvider {...filterFormMethods}>
            <HRScreeningFilterMenu
              fetchData={fetchData}
              handleReset={handleReset}
              positionOptionList={positionOptionList}
            />
          </FormProvider>
          <ApplicationInformationColumnsMenu
            hiddenColumnList={hiddenColumnList}
            setHiddenColumnList={setHiddenColumnList}
            columnList={Object.keys(formDefaultValues)}
          />
        </Group>
      </Box>
      <HRScreeningSpreadsheetTable
        data={data}
        isLoading={isLoading}
        page={page}
        handlePagination={handlePagination}
        sort={sort}
        setSort={setSort}
        isMax={isMax}
        hiddenColumnList={hiddenColumnList}
        handleUpdateHRScreeningStatus={handleUpdateHRScreeningStatus}
      />
    </Stack>
  );
};

export default HRScreeningSpreadsheetView;
