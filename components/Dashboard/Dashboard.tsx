import { getRequestList, getRequestListByForm } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  RequestByFormType,
  RequestType,
  TeamMemberWithUserType,
} from "@/utils/types";
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
};

const Dashboard = ({ requestList, requestListCount }: DashboardProps) => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [requestCount, setRequestCount] = useState(requestListCount);
  const [requestListByForm, setRequestListByForm] = useState<
    RequestByFormType[] | null
  >(null);

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
      if (value) {
        const requestListByFormData = await getRequestListByForm(
          supabaseClient,
          {
            formId: value,
          }
        );
        // map field responses according to request id
        // current backend api is getting responses by field id only
        const requestListWithMatchingResponses = requestListByFormData.map(
          (request) => {
            const matchingResponses = request.request_form.form_section.map(
              (section) => {
                const sectionFields = section.section_field.map((field) => {
                  const filteredResponseByRequestId =
                    field.field_response.filter(
                      (response) =>
                        response.request_response_request_id ===
                        request.request_id
                    );

                  return {
                    ...field,
                    field_response: filteredResponseByRequestId,
                  };
                });

                return {
                  ...section,
                  section_field: sectionFields,
                };
              }
            );
            return {
              ...request,
              request_form: {
                ...request.request_form,
                form_section: matchingResponses,
              },
            };
          }
        );
        setRequestListByForm(requestListWithMatchingResponses);
      }

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
              selectedForm={selectedForm}
              requestListByForm={requestListByForm}
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
