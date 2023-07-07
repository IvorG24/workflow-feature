import { getDashboardOverViewData } from "@/backend/api/get";
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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Overview from "./OverviewTab/Overview";
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
  const [overviewTabDataCount, setOverviewTabDataCount] = useState(0);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      const { data, count } = await getDashboardOverViewData(supabaseClient, {
        teamId: activeTeamId,
        formId: selectedForm ? selectedForm : undefined,
      });
      setOverviewTabData(data);
      setOverviewTabDataCount(count ? count : 0);
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

  const renderTabs = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <>
            <LoadingOverlay visible={isLoading} overlayBlur={2} />
            <Overview
              requestList={overviewTabData ? overviewTabData : []}
              requestCount={overviewTabDataCount}
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
              w={300}
              placeholder="Select a Form"
              data={formList.map((form) => ({
                value: form.form_id,
                label: form.form_name,
              }))}
              value={selectedForm}
              onChange={setSelectedForm}
              searchable
            />
          </Group>
        </Flex>
        {!selectedForm && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="blue">
            Please select a form to generate data.
          </Alert>
        )}
        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
