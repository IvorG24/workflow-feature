import { getRequestList } from "@/backend/api/get";
import { OTPDataType } from "@/pages/team-requests/forms/[formId]/analytics";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { Container, LoadingOverlay, Select, Tabs, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconChartHistogram,
  IconMessageCircle,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { useState } from "react";
import Overview from "./OverviewTab/Overview";
import OrderToPurchaseAnalytics from "./RequisitionTab/OrderToPurchaseAnalytics";
import ResponseTab from "./ResponseTab/ResponseTab";

type DashboardProps = {
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamRequisitionData: OTPDataType;
  userRequisitionData?: OTPDataType;
  purchaseRequisitionData?: OTPDataType;
};

const Dashboard = ({
  requestList,
  requestListCount,
  teamRequisitionData,
  userRequisitionData,
  purchaseRequisitionData,
}: DashboardProps) => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [requestCount, setRequestCount] = useState(requestListCount);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // check if selected form is formsly form
  const isFormslyForm = formList.find(
    (form) => form.form_id === selectedForm
  )?.form_is_formsly_form;

  // filter data by selected request form
  const handleFilterRequestList = async (value: string) => {
    setSelectedForm(value);
    try {
      setIsFetchingData(true);
      const { data, count } = await getRequestList(supabaseClient, {
        teamId: activeTeam.team_id,
        page: 1,
        limit: 9999999,
        form: value ? [value] : undefined,
      });
      setVisibleRequestList(data as RequestType[]);
      setRequestCount(count as number);
    } catch (error) {
      notifications.show({
        title: "Something went wrong.",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  return (
    <Container p={0} fluid>
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      <Select
        maw={300}
        mb="sm"
        label="Select Form"
        placeholder="All forms"
        data={formList.map((form) => ({
          value: form.form_id,
          label: form.form_name,
        }))}
        value={selectedForm}
        onChange={handleFilterRequestList}
        clearable
      />

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab
            value="overview"
            icon={<IconReportAnalytics size="0.8rem" />}
          >
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            value="responses"
            icon={<IconMessageCircle size="0.8rem" />}
          >
            Responses
          </Tabs.Tab>
          <Tabs.Tab
            value="requisition"
            icon={<IconChartHistogram size="0.8rem" />}
          >
            Requisition
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xs">
          <Overview
            requestList={visibleRequestList}
            requestCount={requestCount}
          />
        </Tabs.Panel>

        <Tabs.Panel value="responses" pt="xs">
          <ResponseTab
            selectedForm={selectedForm}
            isFormslyForm={isFormslyForm}
          />
        </Tabs.Panel>

        <Tabs.Panel value="requisition" pt="xs">
          {isFormslyForm ? (
            <OrderToPurchaseAnalytics
              teamOrderToPurchaseData={teamRequisitionData}
              userOrderToPurchaseData={userRequisitionData}
              purchaseOrderToPurchaseData={purchaseRequisitionData}
            />
          ) : (
            <Text>No data available.</Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
