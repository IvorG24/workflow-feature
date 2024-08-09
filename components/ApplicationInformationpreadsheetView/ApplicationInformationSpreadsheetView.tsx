import { getApplicationInformationSummaryData } from "@/backend/api/get";
import { DEFAULT_NUMBER_SSOT_ROWS } from "@/utils/constant";
import {
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import { Box, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import ApplicationInformationSpreadsheetTable from "./ApplicationInformationSpreadsheetTable/ApplicationInformationSpreadsheetTable";

export type FilterFormValues = {
  page: number;
  sort: {
    field: string;
    order: string;
    dataType: string;
  };
  // requestFilter: {
  //   requestId: string;
  //   dateCreatedRange: {
  //     start: string;
  //     end: string;
  //   };
  //   status: string[];
  //   dateUpdatedRange: { start: string; end: string };
  //   approver: string[];
  // };
  // responseFilter: {
  //   position: string[];
  //   certificate: boolean;
  //   license: boolean;
  //   source: string[];
  //   firstName: string;
  //   middleName: string;
  //   lastName: string;
  //   gender: string[];
  //   ageRange: {
  //     start: number;
  //     end: number;
  //   };
  //   civilStatus: string[];
  //   contactNumber: string;
  //   emailAddress: string;
  //   region: string;
  //   province: string;
  //   city: string;
  //   barangay: string;
  //   street: string;
  //   zipCode: string;
  //   sssId: string;
  //   sssIdAttachment: boolean;
  //   philhealthNumber: string;
  //   pagibigNumber: string;
  //   tin: string;
  //   highestEducationalAttainment: string[];
  //   degree: string;
  //   torOrDiplomaAttachment: boolean;
  //   school: string;
  //   yearGraduated: {
  //     start: number;
  //     end: number;
  //   };
  //   employmentStatus: string[];
  // };
};

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

  const fetchData = async (data: FilterFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const newData = await getApplicationInformationSummaryData(
        supabaseClient,
        {
          userId: user.id,
          limit: DEFAULT_NUMBER_SSOT_ROWS,
          ...data,
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
      sort,
    });
  };

  useEffect(() => {
    const handleSorting = async () => {
      await fetchData({
        page,
        sort,
      });
    };
    handleSorting();
  }, [sort]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchData({
        page,
        sort,
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
          {/* <FormProvider {...filterFormMethods}>
            <ApplicationInformationFilterMenu />
          </FormProvider> */}
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
