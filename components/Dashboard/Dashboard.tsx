import { getRequestListByForm } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { generateFormslyResponseData } from "@/utils/arrayFunctions/dashboard";
import {
  FieldWithResponseType,
  RequestByFormType,
  RequestResponseDataType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Button,
  Container,
  Group,
  LoadingOverlay,
  Select,
  Tabs,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconChartHistogram,
  IconMessageCircle,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { useState } from "react";
import Overview from "./OverviewTab/Overview";
import RequisitionTab from "./RequisitionTab/RequisitionTab";
import ResponseTab from "./ResponseTab/ResponseTab";

type DashboardProps = {
  requestList: RequestByFormType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const filteredResponseTypes = ["TEXT", "TEXTAREA", "LINK", "FILE"];
const statusFilter = [
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELED", label: "Canceled" },
];

const Dashboard = ({ requestList, requestListCount }: DashboardProps) => {
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isOTPForm, setIsOTPForm] = useState(false);
  const [visibleRequestList, setVisibleRequestList] = useState(requestList);
  const [requestCount, setRequestCount] = useState(requestListCount);
  const [fieldResponseData, setFieldResponseData] = useState<
    RequestResponseDataType[] | null
  >(null);

  // check if selected form is formsly form
  const isFormslyForm =
    formList.find((form) => form.form_id === selectedForm)
      ?.form_is_formsly_form || false;
  const selectedFormName =
    formList.find((form) => form.form_id === selectedForm)?.form_name || false;

  const handleFilterRequestList = async () => {
    try {
      setIsFetchingData(true);
      const { data, count } = await getRequestListByForm(supabaseClient, {
        teamId: activeTeam.team_id,
        formId: selectedForm ? selectedForm : undefined,
        requestStatus: selectedStatus ? selectedStatus : undefined,
      });

      if (!data) throw Error;

      const requestListWithMatchingResponses = data.map((request) => {
        const matchingResponses = request.request_form.form_section.map(
          (section) => {
            const sectionFields = section.section_field.map((field) => {
              const filteredResponseByRequestId = field.field_response.filter(
                (response) =>
                  response.request_response_request_id === request.request_id
              );

              const filteredResponseWithDateCreated =
                filteredResponseByRequestId.map((response) => ({
                  ...response,
                  request_response_date_purchased: request.request_date_created,
                  request_response_team_member_id:
                    request.request_team_member_id,
                }));

              return {
                ...field,
                field_response: filteredResponseWithDateCreated,
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
      });
      if (selectedForm) {
        handleResponseTabData(requestListWithMatchingResponses);
      }

      setVisibleRequestList(data as RequestByFormType[]);
      setIsOTPForm(isFormslyForm && selectedFormName === "Order to Purchase");
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

  const handleResponseTabData = (requestListByForm: RequestByFormType[]) => {
    try {
      if (!requestListByForm) return;

      const sectionList = requestListByForm.flatMap(
        (request) => request.request_form.form_section
      );

      const fieldWithResponse: FieldWithResponseType = [];
      sectionList.forEach((section) =>
        section.section_field.forEach((field) => {
          if (field.field_response.length > 0) {
            fieldWithResponse.push(field);
          }
        })
      );

      const uniqueFieldList = fieldWithResponse.reduce((acc, field) => {
        const duplicateFieldIndex = acc.findIndex(
          (f) => f.field_id === field.field_id
        );

        if (duplicateFieldIndex >= 0) {
          const updatedResponseList = [
            ...acc[duplicateFieldIndex].field_response,
            ...field.field_response,
          ];
          acc[duplicateFieldIndex].field_response = updatedResponseList;
        } else {
          acc.push(field);
        }

        return acc;
      }, [] as FieldWithResponseType);

      if (
        isFormslyForm &&
        selectedFormName === "Order to Purchase" &&
        sectionList.length > 0
      ) {
        const responseData = generateFormslyResponseData(
          uniqueFieldList,
          sectionList
        );
        setFieldResponseData(responseData);
      } else {
        const nonDynamicFieldList = uniqueFieldList.filter(
          (field) => !filteredResponseTypes.includes(field.field_type)
        );
        const groupedRequestFormData = nonDynamicFieldList.map((field) => ({
          sectionLabel: field.field_name,
          responseData: [field],
        }));
        setFieldResponseData(groupedRequestFormData);
      }
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Can't fetch data at the moment.",
        message: "Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container p={0} maw={1108} h="100%">
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      <Group mb="md">
        <Select
          maw={300}
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
          maw={300}
          placeholder="Status"
          data={statusFilter}
          value={selectedStatus}
          onChange={setSelectedStatus}
          clearable
        />
        <Button onClick={() => handleFilterRequestList()}>Fetch Data</Button>
      </Group>

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
            isOTPForm={isOTPForm}
            selectedForm={selectedForm}
            fieldResponseData={fieldResponseData}
          />
        </Tabs.Panel>

        <Tabs.Panel value="requisition" pt="xs">
          {isFormslyForm && fieldResponseData ? (
            <RequisitionTab fieldResponseData={fieldResponseData} />
          ) : (
            <Text>No data available.</Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
