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
import { useLocalStorage } from "@mantine/hooks";
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
import ApplicationInformationColumnsMenu from "./ApplicationInformationColumnsMenu";
import ApplicationInformationFilterMenu from "./ApplicationInformationFilterMenu";
import ApplicationInformationSpreadsheetTable from "./ApplicationInformationSpreadsheetTable/ApplicationInformationSpreadsheetTable";

const initialSort = {
  field: "request_date_created",
  order: "DESC",
  dataType: "DATE",
};

const formDefaultValues = {
  requestFilter: {
    requestId: "",
    dateCreatedRange: {
      start: "",
      end: "",
    },
    status: [],
    dateUpdatedRange: { start: "", end: "" },
    approver: [],
  },
  responseFilter: {
    position: [],
    certification: null,
    license: null,
    source: [],
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    ageRange: {
      start: null,
      end: null,
    },
    civilStatus: [],
    contactNumber: "",
    emailAddress: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    zipCode: "",
    sssId: "",
    philhealthNumber: "",
    pagibigNumber: "",
    tin: "",
    highestEducationalAttainment: [],
    degree: "",
    torOrDiplomaAttachment: null,
    school: "",
    yearGraduated: {
      start: null,
      end: null,
    },
    employmentStatus: "",
    workedAtStaClara: null,
    willingToBeAssignedAnywhere: null,
    regionWillingToBeAssigned: [],
    soonestJoiningDate: {
      start: null,
      end: null,
    },
    workExperience: {
      start: null,
      end: null,
    },
    expectedSalary: {
      start: null,
      end: null,
    },
  },
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
  const [hiddenColumnList, setHiddenColumnList] = useLocalStorage<string[]>({
    key: "ApplicationInformationColumns",
    defaultValue: [],
  });

  const filterFormMethods = useForm<ApplicationInformationFilterFormValues>({
    defaultValues:
      formDefaultValues as unknown as ApplicationInformationFilterFormValues,
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

      if (page === 1) {
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
      formDefaultValues as unknown as ApplicationInformationFilterFormValues
    );
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

      const storedData = localStorage.getItem(
        "applicationInformationSpreadsheetView"
      );
      if (storedData) {
        const filterData: ApplicationInformationFilterFormValues =
          JSON.parse(storedData);
        setSort(filterData.sort ?? initialSort);
        filterFormMethods.reset(
          filterData as ApplicationInformationFilterFormValues
        );
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
  }, []);

  return (
    <Stack pos="relative">
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Application Information Spreadsheet View
          </Title>

          <Button
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
          <ApplicationInformationColumnsMenu
            sectionList={sectionList.filter(
              (section) =>
                section.section_name !== "Most Recent Work Experience"
            )}
            hiddenColumnList={hiddenColumnList}
            setHiddenColumnList={setHiddenColumnList}
          />
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
        hiddenColumnList={hiddenColumnList}
      />
    </Stack>
  );
};

export default ApplicationInformationSpreadsheetView;
