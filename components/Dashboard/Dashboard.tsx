import {
  getDashboardOverViewData,
  getRequestStatusCount,
} from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { RequestDashboardOverviewData } from "@/utils/types";
import {
  Alert,
  Box,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  SegmentedControl,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Overview, { RequestStatusDataType } from "./OverviewTab/Overview";
import ResponseTab from "./ResponseTab/ResponseTab";

const TABS = ["overview", "responses"];
const SPECIAL_FORMS = [
  "Order to Purchase",
  "Receiving Inspecting Report",
  "Quotation",
];

type Props = {
  activeTeamId: string;
};

const Dashboard = ({ activeTeamId }: Props) => {
  const formList = useFormList();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const routerFormId =
    router.query.formId !== undefined ? `${router.query.formId}` : null;
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(routerFormId);
  const [isOTPForm, setIsOTPForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overviewTabData, setOverviewTabData] = useState<
    RequestDashboardOverviewData[] | null
  >(null);
  const [requestStatusData, setRequestStatusData] = useState<
    RequestStatusDataType[] | null
  >(null);
  const [totalRequestCount, setTotalRequestCount] = useState(0);
  const currentDate = moment();
  const dateFilterList = [
    {
      value: moment({ year: currentDate.year(), month: 0, day: 1 }).format(
        "YYYY-MM-DD"
      ),
      label: "This year",
    },
    {
      value: moment(currentDate).subtract(6, "months").format("YYYY-MM-DD"),
      label: "Last 6 months",
    },
  ];
  const [dateFilter, setDateFilter] = useState(dateFilterList[0].value);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      const { data } = await getDashboardOverViewData(supabaseClient, {
        teamId: activeTeamId,
        formId: selectedForm ? selectedForm : undefined,
      });
      setOverviewTabData(data);
      setIsLoading(false);
    };

    if (selectedForm) {
      fetchOverviewData();
    }
  }, [activeTeamId, selectedForm, supabaseClient]);

  // check if selected form is formsly form
  const isFormslyForm =
    formList.find((form) => form.form_id === selectedForm)
      ?.form_is_formsly_form || false;
  const selectedFormName =
    formList.find((form) => form.form_id === selectedForm)?.form_name || "";

  useEffect(() => {
    setIsOTPForm(isFormslyForm && SPECIAL_FORMS.includes(selectedFormName));
  }, [isFormslyForm, selectedFormName]);

  useEffect(() => {
    const fetchRequestStatusCount = async (selectedForm: string) => {
      const { data, count } = await getRequestStatusCount(supabaseClient, {
        formId: selectedForm,
        startDate: dateFilter,
        endDate: currentDate.format("YYYY-MM-DD"),
      });
      setRequestStatusData(data);
      setTotalRequestCount(count ? count : 0);
    };

    if (selectedForm) {
      fetchRequestStatusCount(selectedForm);
    }
  }, [selectedForm, dateFilter]);

  const renderTabs = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <>
            <LoadingOverlay visible={isLoading} overlayBlur={2} />
            {!selectedForm && (
              <Alert
                mb="sm"
                icon={<IconAlertCircle size="1rem" />}
                color="blue"
              >
                Please select a form to generate data.
              </Alert>
            )}
            <Overview
              requestStatusData={requestStatusData ? requestStatusData : []}
              requestCount={totalRequestCount}
              requestList={overviewTabData ? overviewTabData : []}
            />
          </>
        );

      case "responses":
        return selectedForm ? (
          <ResponseTab
            isOTPForm={isOTPForm}
            selectedForm={selectedForm}
            selectedFormName={selectedFormName}
            activeTeamId={activeTeamId}
          />
        ) : (
          <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
            Please select a form to generate data.
          </Alert>
        );
    }
  };

  return (
    <Container p={0} maw={1024} h="100%" pos="relative">
      <Stack>
        <Title order={2}>Dashboard</Title>
        <Flex justify="space-between" rowGap="sm" wrap="wrap">
          <SegmentedControl
            value={selectedTab}
            onChange={setSelectedTab}
            data={TABS.map((tab) => ({ value: tab, label: startCase(tab) }))}
          />

          <Group>
            <Select
              w={250}
              placeholder="Select a Form"
              data={formList.map((form) => ({
                value: form.form_id,
                label: form.form_name,
              }))}
              value={selectedForm}
              onChange={setSelectedForm}
              searchable
            />
            <Select
              data={dateFilterList}
              value={dateFilter}
              onChange={(value: string) => setDateFilter(value)}
            />
          </Group>
        </Flex>
        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
