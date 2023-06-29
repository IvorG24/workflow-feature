import useFetchRequestListByForm from "@/hooks/useFetchRequestListByForm";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";

import {
  Box,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useEffect, useState } from "react";
import Overview from "./OverviewTab/Overview";
import RequisitionTab from "./RequisitionTab/RequisitionTab";

const statusFilter = [
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELED", label: "Canceled" },
];

// REMOVED "responses" TAB
const TABS = ["overview", "requisition"];

const Dashboard = () => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isOTPForm, setIsOTPForm] = useState(false);

  // swr fetching
  const {
    requestList: requestListData,
    requestListCount,
    isLoading,
  } = useFetchRequestListByForm({
    teamId: activeTeam.team_id,
    formId: selectedForm,
    requestStatus: selectedStatus,
    supabaseClient,
  });

  // check if selected form is formsly form
  const isFormslyForm =
    formList.find((form) => form.form_id === selectedForm)
      ?.form_is_formsly_form || false;
  const selectedFormName =
    formList.find((form) => form.form_id === selectedForm)?.form_name || false;

  // update data for response and requisition tabs
  // const handleResponseTabData = () => {
  //   try {
  //     if (!requestListData) return;

  //     const sectionList = requestListData.flatMap(
  //       (request) => request.request_form.form_section
  //     );

  //     if (
  //       isFormslyForm &&
  //       selectedFormName === "Order to Purchase" &&
  //       sectionList.length > 0
  //     ) {
  //       const responseData = generateFormslyResponseData(sectionList);
  //       setFieldResponseData(responseData);
  //     } else {
  //       const groupedRequestFormData = getRequestFormData(sectionList);
  //       setFieldResponseData(groupedRequestFormData);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     notifications.show({
  //       title: "Can't fetch data at the moment.",
  //       message: "Please try again later.",
  //       color: "red",
  //     });
  //   }
  // };

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

      // case "responses":
      //   return (
      //     <ResponseTab
      //       isOTPForm={isOTPForm}
      //       selectedForm={selectedForm}
      //       fieldResponseData={fieldResponseData}
      //     />
      //   );

      case "requisition":
        return isOTPForm && selectedForm ? (
          <RequisitionTab
            selectedForm={selectedForm}
            selectedStatus={selectedStatus}
          />
        ) : (
          <Text>No data available.</Text>
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
            <Select
              w={120}
              placeholder="Status"
              data={formList.length > 0 ? statusFilter : []}
              value={selectedStatus}
              onChange={setSelectedStatus}
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
