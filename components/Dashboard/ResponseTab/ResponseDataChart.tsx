import { getRequestListByForm } from "@/backend/api/get";
import { FieldType, RequestByFormType } from "@/utils/types";
import {
  Alert,
  Container,
  Flex,
  LoadingOverlay,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { lowerCase } from "lodash";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import ResponseTable from "./ResponseTable";

export type ResponseDataType = {
  id: string;
  isPositiveMetric: boolean;
  type: FieldType;
  label: string;
  optionList: string[];
  responseList: { label: string; count: number }[];
}[];

type ResponseDataProps = {
  selectedForm: string | null;
};

type FieldWithResponseType =
  RequestByFormType["request_form"]["form_section"][0]["section_field"];

const dynamicTypes = ["TEXT", "TEXTAREA"];

const parseResponse = (field_type: string, responseValue: string) => {
  switch (field_type) {
    case "DATE":
      return moment(responseValue).format("MMM D, YYYY");

    default:
      return JSON.parse(responseValue);
  }
};

const responseFieldReducer = (response: FieldWithResponseType) => {
  const reducedFieldWithResponse = response.reduce((acc, field) => {
    const index = acc.findIndex((d) => d.id === field.field_id);

    const reducedResponses = field.field_response.reduce((acc, response) => {
      const parseResponseValue =
        field.field_type === "MULTISELECT"
          ? JSON.parse(response.request_response)[0]
          : JSON.parse(response.request_response);

      const responseMatchIndex = acc.findIndex(
        (responseItem) =>
          lowerCase(responseItem.label) === lowerCase(parseResponseValue)
      );

      if (responseMatchIndex >= 0) {
        acc[responseMatchIndex].count++;
      } else {
        if (field.field_type === "MULTISELECT") {
          const responseValues = JSON.parse(response.request_response);
          responseValues.forEach((value: string) => {
            acc[acc.length] = {
              label: parseResponse(field.field_type, JSON.stringify(value)),
              count: 1,
            };
          });
        } else {
          acc[acc.length] = {
            label: parseResponse(field.field_type, response.request_response),
            count: 1,
          };
        }
      }

      return acc;
    }, [] as ResponseDataType[0]["responseList"]);

    const options = field.field_option.map((option) => option.option_value);

    if (index >= 0) {
      acc[index].responseList = reducedResponses;
    } else {
      acc[acc.length] = {
        id: field.field_id,
        isPositiveMetric: field.field_is_positive_metric,
        type: field.field_type as FieldType,
        label: field.field_name,
        optionList: options,
        responseList: reducedResponses,
      };
    }

    return acc;
  }, [] as ResponseDataType);

  return reducedFieldWithResponse;
};

const ResponseDataChart = ({ selectedForm }: ResponseDataProps) => {
  const supabaseClient = useSupabaseClient();
  const prevSelectedFormProp = useRef(selectedForm);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [responseData, setResponseData] = useState<ResponseDataType | null>(
    null
  );

  const handleFetchResponseData = async () => {
    try {
      setIsFetchingData(true);
      if (selectedForm === null) {
        return notifications.show({
          title: "Please select a form",
          message: "Choose a form from the form filter.",
          color: "orange",
        });
      }

      const requestList = await getRequestListByForm(supabaseClient, {
        formId: selectedForm,
      });

      const sectionList = requestList.flatMap(
        (request) => request.request_form.form_section
      );
      const fieldWithResponse: FieldWithResponseType = [];

      sectionList.forEach((section) =>
        section.section_field.forEach((field) => fieldWithResponse.push(field))
      );

      const reducedFieldWithResponse = responseFieldReducer(fieldWithResponse);
      const nonDynamicResponseList = reducedFieldWithResponse.filter(
        (field) => !dynamicTypes.includes(field.type)
      );
      setResponseData(nonDynamicResponseList);
    } catch (error) {
      notifications.show({
        title: "Can't fetch data at the moment.",
        message: "Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  useEffect(() => {
    if (prevSelectedFormProp.current !== selectedForm) {
      //re-fetch data
      handleFetchResponseData();
    } else if (!selectedForm) {
      setResponseData(null);
    }
  }, [selectedForm]);

  return (
    <Container mt="sm" fluid>
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      <Alert mb="md" icon={<IconAlertCircle size="1rem" />} title="Notice!">
        Text and Textarea fields are dynamic types and require manual data
        generation for responses. Please use the keyword search to generate the
        desired response data.
      </Alert>
      <Flex gap="md" align="center" wrap="wrap">
        <TextInput
          w={320}
          placeholder="Search response data by keyword"
          icon={<IconSearch size="16px" />}
        />
      </Flex>

      <Flex wrap="wrap" gap="md">
        {responseData && responseData.length > 0 ? (
          responseData.map((response, idx) => (
            <ResponseTable key={response.label + idx} response={response} />
          ))
        ) : (
          <Title mt="xl" order={3} align="center">
            No data available.
          </Title>
        )}
      </Flex>
    </Container>
  );
};

export default ResponseDataChart;
