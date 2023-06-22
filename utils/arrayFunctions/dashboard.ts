import { StackedBarChartDataType } from "@/components/Chart/StackedBarChart";
import moment from "moment";
import {
  FieldType,
  FieldWithResponseType,
  LineChartDataType,
  RequestByFormType,
  ResponseDataType,
  SearchKeywordResponseType,
} from "../types";

export const searchResponseReducer = (data: SearchKeywordResponseType[]) => {
  return data.reduce((acc, item) => {
    const existingItem = acc.find(
      (x) => x.id === item.request_response_field_id
    );
    const label = item.response_field.field_name;
    const parseResponse = JSON.parse(item.request_response);
    const responseItem = { label: parseResponse, value: 1 };

    if (existingItem) {
      const duplicateResponseIndex = existingItem.responseList.findIndex(
        (d) => d.label === parseResponse
      );
      if (duplicateResponseIndex >= 0) {
        existingItem.responseList[duplicateResponseIndex].value++;
      } else {
        existingItem.responseList.push(responseItem);
      }
    } else {
      const newItem: ResponseDataType = {
        id: item.request_response_field_id,
        type: item.response_field.field_type as FieldType,
        label,
        optionList: [],
        responseList: [responseItem],
      };
      acc[acc.length] = newItem;
    }
    return acc;
  }, [] as ResponseDataType[]);
};

export const generateFormslyResponseData = (
  uniqueFieldList: FieldWithResponseType,
  sectionList: RequestByFormType["request_form"]["form_section"]
) => {
  const itemLabelList = uniqueFieldList
    .filter((field) => field.field_name === "General Name")
    .flatMap((field) => field.field_response);

  // group response by General Name
  const itemLabelWithDuplicateIdList = itemLabelList.reduce(
    (acc, item) => {
      const parsedLabel = JSON.parse(item.request_response);
      const itemDuplicateId = item.request_response_duplicatable_section_id;
      const duplicateItemIndex = acc.findIndex((f) => f.label === parsedLabel);

      if (duplicateItemIndex >= 0) {
        if (itemDuplicateId) {
          const duplicateIndexIdList = acc[duplicateItemIndex].duplicateId;
          if (!duplicateIndexIdList.includes(itemDuplicateId)) {
            acc[duplicateItemIndex].duplicateId.push(itemDuplicateId);
          }
        }
      } else {
        const newLabel = {
          label: parsedLabel,
          duplicateId: itemDuplicateId ? [itemDuplicateId] : [],
        };

        acc.push(newLabel);
      }

      return acc;
    },
    [] as {
      label: string;
      duplicateId: string[];
    }[]
  );

  // group item section
  const groupedResponseData = itemLabelWithDuplicateIdList.map((itemLabel) => {
    const responseMatch = uniqueFieldList.map((field) => {
      const fieldResponseMatch = field.field_response.filter((fieldResponse) =>
        itemLabel.duplicateId.includes(
          `${fieldResponse.request_response_duplicatable_section_id}`
        )
      );

      return {
        ...field,
        field_response: fieldResponseMatch,
      };
    });

    const itemResponseMatch = responseMatch.filter(
      (responseItem) => responseItem.field_response.length > 0
    );

    return {
      sectionLabel: itemLabel.label,
      responseData: itemResponseMatch,
    };
  });

  // add Main section
  const mainSection = sectionList.filter(
    (section) => section.section_name === "Main"
  )[0];

  const mainFieldWithResponse = uniqueFieldList.filter(
    (field) => field.field_section_id === mainSection.section_id
  );

  const groupedMainSection = {
    sectionLabel: mainSection.section_name,
    responseData: mainFieldWithResponse,
  };

  return [groupedMainSection, ...groupedResponseData];
};

export const getUniqueResponseData = (
  data: FieldWithResponseType[0]["field_response"]
) => {
  const uniqueResponseData = data.reduce((acc, response) => {
    const parseResponseValue = JSON.parse(response.request_response);
    const duplicateResponseIndex = acc.findIndex(
      (res) => res.label === parseResponseValue
    );

    if (duplicateResponseIndex >= 0) {
      acc[duplicateResponseIndex].value++;
    } else {
      const newResponse = { label: parseResponseValue, value: 1 };
      acc.push(newResponse);
    }

    return acc;
  }, [] as LineChartDataType[]);

  const sortedUniqueResponseData = uniqueResponseData.sort(
    (a, b) => b.value - a.value
  );
  return sortedUniqueResponseData;
};

export const getStackedBarChartData = (
  requestList: RequestByFormType[],
  initialChartData: StackedBarChartDataType[]
) => {
  const reducedRequestList = requestList.reduce((acc, request) => {
    const requestMonthCreated = moment(request.request_date_created).format(
      "MMM"
    );
    const status = request.request_status.toLowerCase();
    const duplicateIndex = acc.findIndex(
      (duplicate) => duplicate.month === requestMonthCreated
    );

    if (duplicateIndex >= 0) {
      switch (status) {
        case "approved":
          acc[duplicateIndex].approved++;
          break;
        case "rejected":
          acc[duplicateIndex].rejected++;
          break;
        case "pending":
          acc[duplicateIndex].pending++;
          break;
        case "canceled":
          acc[duplicateIndex].canceled++;
          break;

        default:
          break;
      }
    } else {
      acc[acc.length] = {
        month: requestMonthCreated,
        approved: status === "approved" ? 1 : 0,
        rejected: status === "rejected" ? 1 : 0,
        pending: status === "pending" ? 1 : 0,
        canceled: status === "canceled" ? 1 : 0,
      };
    }

    return acc;
  }, [] as StackedBarChartDataType[]);

  const updatedChartData = initialChartData.map((chartData) => {
    const dataMatch = reducedRequestList.find(
      (requestData) => requestData.month === chartData.month
    );

    if (dataMatch) {
      return dataMatch;
    } else {
      return chartData;
    }
  });

  return updatedChartData;
};
