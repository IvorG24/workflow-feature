import useFetchRequestListByForm from "@/hooks/useFetchRequestListByForm";
import { useFormList } from "@/stores/useFormStore";
import { generateFormslyResponseData } from "@/utils/arrayFunctions/dashboard";
import {
  FieldWithResponseType,
  RequestByFormType,
  RequestResponseDataType,
} from "@/utils/types";
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
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useEffect, useState } from "react";
import Overview from "./OverviewTab/Overview";
import RequisitionTab from "./RequisitionTab/RequisitionTab";

type DashboardProps = {
  teamId: string;
};

const filteredResponseTypes = ["TEXT", "TEXTAREA", "LINK", "FILE"];
const statusFilter = [
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELED", label: "Canceled" },
];

// REMOVED "responses" TAB
const TABS = ["overview", "requisition"];

const Dashboard = ({ teamId }: DashboardProps) => {
  const formList = useFormList();
  const supabaseClient = useSupabaseClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isOTPForm, setIsOTPForm] = useState(false);
  const [fieldResponseData, setFieldResponseData] = useState<
    RequestResponseDataType[] | null
  >(null);

  // swr fetching
  const {
    requestList: requestListData,
    requestListCount,
    isLoading,
  } = useFetchRequestListByForm({
    teamId: teamId,
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

  const handleResponseTabData = (requestListByForm: RequestByFormType[]) => {
    try {
      setIsOTPForm(isFormslyForm && selectedFormName === "Order to Purchase");

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
        const groupedRequestFormData = nonDynamicFieldList.map((field) => {
          const isMultiSelect = field.field_type === "MULTISELECT";
          // get multiselect response
          const multiSelectResponseData: FieldWithResponseType[0]["field_response"] =
            [];

          if (isMultiSelect) {
            field.field_response.forEach((response) => {
              const parseResponse = JSON.parse(response.request_response);
              parseResponse.forEach((responseItem: string) => {
                const newResponse = {
                  ...response,
                  request_response: JSON.stringify(responseItem),
                };

                multiSelectResponseData.push(newResponse);
              });
            });
          }

          const multiSelectData = {
            ...field,
            field_response: multiSelectResponseData,
          };

          return {
            sectionLabel: field.field_name,
            responseData: [isMultiSelect ? multiSelectData : field],
          };
        });
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

  useEffect(() => {
    if (selectedForm) {
      handleResponseTabData(requestListData);
    }
  }, [selectedForm]);

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
        return isOTPForm && fieldResponseData ? (
          <RequisitionTab fieldResponseData={fieldResponseData} />
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
              data={statusFilter}
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
