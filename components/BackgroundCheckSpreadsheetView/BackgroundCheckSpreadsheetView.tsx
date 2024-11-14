import {
  checkSpreadsheetRowStatus,
  getBackgroundCheckSummaryData,
} from "@/backend/api/get";
import { overrideStep } from "@/backend/api/update";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_NUMBER_HR_SSOT_ROWS } from "@/utils/constant";
import { isEqual } from "@/utils/functions";
import { startCase } from "@/utils/string";
import {
  BackgroundCheckFilterFormValues,
  BackgroundCheckSpreadsheetData,
  OptionType,
} from "@/utils/types";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconReload } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useForm } from "react-hook-form";
import BackgroundCheckColumnsMenu from "./BackgroundCheckColumnsMenu";
import BackgroundCheckFilterMenu from "./BackgroundCheckFilterMenu";
import BackgroundCheckSpreadsheetTable from "./BackgroundCheckSpreadsheetTable/BackgroundCheckSpreadsheetTable";

const initialSort = {
  sortBy: "background_check_date_created",
  order: "DESC",
};

const formDefaultValues = {
  position: [],
  application_information_full_name: "",
  application_information_contact_number: "",
  application_information_email: "",
  application_information_request_id: "",
  application_information_score: {
    start: null,
    end: null,
  },
  general_assessment_request_id: "",
  general_assessment_score: {
    start: null,
    end: null,
  },
  technical_assessment_request_id: "",
  technical_assessment_score: {
    start: null,
    end: null,
  },
  background_check_date_created: {
    start: "",
    end: "",
  },
  background_check_status: [],
  background_investigation: "",
  assigned_hr: [],
};

type Props = {
  positionOptionList: OptionType[];
  hrOptionList: OptionType[];
};

const BackgroundCheckSpreadsheetView = ({
  positionOptionList,
  hrOptionList,
}: Props) => {
  const user = useUserProfile();
  const supabaseClient = useSupabaseClient();
  const teamMember = useUserTeamMember();
  const [data, setData] = useState<BackgroundCheckSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [isMax, setIsMax] = useState(false);
  const [hiddenColumnList, setHiddenColumnList] = useLocalStorage<string[]>({
    key: "BackgroundCheckColumns",
    defaultValue: [],
  });

  const prevSortRef = useRef<{
    sortBy: string;
    order: string;
  }>();

  const filterFormMethods = useForm<BackgroundCheckFilterFormValues>({
    defaultValues:
      formDefaultValues as unknown as BackgroundCheckFilterFormValues,
  });

  const fetchData = async (data?: BackgroundCheckFilterFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      setIsMax(false);

      const filterData = filterFormMethods.getValues();

      const newData = await getBackgroundCheckSummaryData(supabaseClient, {
        ...filterData,
        ...data,
        userId: user.user_id,
        limit: DEFAULT_NUMBER_HR_SSOT_ROWS,
        page: data?.page ?? page,
        sort: data?.sort ?? sort,
      });

      if (newData.length < DEFAULT_NUMBER_HR_SSOT_ROWS) {
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
      formDefaultValues as unknown as BackgroundCheckFilterFormValues
    );
    setPage(1);
    fetchData({ page: 1 });
  };

  useBeforeunload(() => {
    const filterData = filterFormMethods.getValues();
    localStorage.setItem(
      "backgroundCheckSpreadsheetView",
      JSON.stringify({
        ...filterData,
        limit: DEFAULT_NUMBER_HR_SSOT_ROWS,
        sort,
      })
    );
  });

  useEffect(() => {
    const handleSorting = async () => {
      await fetchData({ sort, page: 1 });
    };
    if (user && user.user_id && !isEqual(prevSortRef.current, sort)) {
      prevSortRef.current = sort;
      handleSorting();
    }
  }, [sort]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedData = localStorage.getItem("backgroundCheckSpreadsheetView");
      if (storedData) {
        const filterData: BackgroundCheckFilterFormValues =
          JSON.parse(storedData);
        setSort(filterData.sort ?? initialSort);
        filterFormMethods.reset(filterData as BackgroundCheckFilterFormValues);
      } else {
        await fetchData({
          page: 1,
        });
      }
    };
    if (user && user.user_id) {
      fetchInitialData();
    }
  }, [user?.user_id]);

  // const handleUpdateBackgroundCheckStatus = async (
  //   status: string,
  //   data: BackgroundCheckSpreadsheetData
  // ) => {
  //   setIsLoading(true);
  //   try {
  //     if (!teamMember?.team_member_id) throw new Error();

  //     const applicantData = await updateBackgroundCheckStatus(supabaseClient, {
  //       status,
  //       teamMemberId: teamMember.team_member_id,
  //       data,
  //     });

  //     if (status.toUpperCase() === "NOT QUALIFIED") {
  //       const emailNotificationProps: {
  //         to: string;
  //         subject: string;
  //       } & EmailNotificationTemplateProps = {
  //         to: applicantData.user_email,
  //         subject: `Application Status | Sta. Clara International Corporation`,
  //         greetingPhrase: `Dear ${startCase(
  //           applicantData.user_first_name
  //         )} ${startCase(applicantData.user_last_name)},`,
  //         message: `
  //             <p>
  //              We sincerely appreciate your interest in joining Sta. Clara International Corporation under the Application ID: ${data.application_information_request_id}
  //             </p>
  //             <p>
  //               After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.
  //             </p>
  //             <p>
  //               We wish you success in your future professional endeavors.
  //             </p>
  //         `,
  //         closingPhrase: "Best regards,",
  //         signature: "Sta. Clara International Corporation Recruitment Team",
  //       };
  //       await fetch("/api/resend/send", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(emailNotificationProps),
  //       });
  //     }

  //     setData((prev) =>
  //       prev.map((prevData) => {
  //         if (prevData.hr_request_reference_id !== data.hr_request_reference_id)
  //           return prevData;

  //         return {
  //           ...prevData,
  //           background_check_status: status,
  //         };
  //       })
  //     );
  //     notifications.show({
  //       message: "Status updated.",
  //       color: "green",
  //     });
  //   } catch (e) {
  //     notifications.show({
  //       message: "Something went wrong. Please try again later.",
  //       color: "red",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCheckRow = async (item: BackgroundCheckSpreadsheetData) => {
    try {
      setIsLoading(true);
      const fetchedRow = await checkSpreadsheetRowStatus(supabaseClient, {
        id: item.background_check_id,
        status: item.background_check_status,
        table: "background_check",
      });
      if (fetchedRow) {
        setData((prev) =>
          prev.map((thisItem) => {
            if (thisItem.background_check_id !== item.background_check_id)
              return thisItem;
            return fetchedRow as unknown as BackgroundCheckSpreadsheetData;
          })
        );
        notifications.show({
          message: "This row is already updated.",
          color: "orange",
        });
        return false;
      }
      return true;
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverride = async (hrTeamMemberId: string, rowId: string) => {
    try {
      if (!teamMember) return;

      setIsLoading(true);
      await overrideStep(supabaseClient, {
        hrTeamMemberId: teamMember?.team_member_id,
        rowId,
        table: "background_check",
      });

      setData((prev) =>
        prev.map((thisItem) => {
          if (thisItem.background_check_id !== rowId) return thisItem;
          return {
            ...thisItem,
            assigned_hr: startCase(
              `${user?.user_first_name} ${user?.user_last_name}`
            ),
            assigned_hr_team_member_id: hrTeamMemberId,
          };
        })
      );

      notifications.show({
        message: "The applicant is successfully reassigned.",
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
            Background Check Spreadsheet View
          </Title>
          <Button
            leftIcon={<IconReload size={16} />}
            onClick={() => {
              setPage(1);
              fetchData({ page: 1 });
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <FormProvider {...filterFormMethods}>
            <BackgroundCheckFilterMenu
              fetchData={fetchData}
              handleReset={handleReset}
              positionOptionList={positionOptionList}
              hrOptionList={hrOptionList}
              isLoading={isLoading}
            />
          </FormProvider>
          <BackgroundCheckColumnsMenu
            hiddenColumnList={hiddenColumnList}
            setHiddenColumnList={setHiddenColumnList}
            columnList={Object.keys(formDefaultValues)}
          />
        </Group>
      </Box>
      <BackgroundCheckSpreadsheetTable
        data={data}
        isLoading={isLoading}
        page={page}
        handlePagination={handlePagination}
        sort={sort}
        setSort={setSort}
        isMax={isMax}
        hiddenColumnList={hiddenColumnList}
        setData={setData}
        handleCheckRow={handleCheckRow}
        handleOverride={handleOverride}
      />
    </Stack>
  );
};

export default BackgroundCheckSpreadsheetView;
