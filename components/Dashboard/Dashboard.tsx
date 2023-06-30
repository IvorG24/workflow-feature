import useFetchRequestListByForm from "@/hooks/useFetchRequestListByForm";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";

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

const Dashboard = () => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const routerFormId =
    router.query.formId !== undefined ? `${router.query.formId}` : null;
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(routerFormId);
  const [isOTPForm, setIsOTPForm] = useState(false);

  // swr fetching
  const {
    requestList: requestListData,
    requestListCount,
    isLoading,
  } = useFetchRequestListByForm({
    teamId: activeTeam.team_id,
    formId: selectedForm,
    supabaseClient,
  });

  // check if selected form is formsly form
  const isFormslyForm =
    formList.find((form) => form.form_id === selectedForm)
      ?.form_is_formsly_form || false;
  const selectedFormName =
    formList.find((form) => form.form_id === selectedForm)?.form_name || false;

  useEffect(() => {
    setIsOTPForm(isFormslyForm && selectedFormName === "Order to Purchase");
  }, [isFormslyForm, selectedFormName]);

  const renderTabs = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <Overview
            requestList={requestListData}
            requestCount={requestListCount ? requestListCount : 0}
          />
        );

      case "responses":
        return selectedForm ? (
          <ResponseTab
            isOTPForm={isOTPForm}
            selectedForm={selectedForm}
            requestList={requestListData}
          />
        ) : (
          <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
            Please select a form to generate data.
          </Alert>
        );
    }
  };

  return (
    <Container p={0} maw={1024} h="100%">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

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
              maw={200}
              placeholder="All forms"
              data={formList.map((form) => ({
                value: form.form_id,
                label: form.form_name,
              }))}
              value={selectedForm}
              onChange={setSelectedForm}
              clearable
            />
          </Group>
        </Flex>

        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
