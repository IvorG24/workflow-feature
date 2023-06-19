import { lowerCase } from "lodash";
import moment from "moment";
import {
  FieldTableRow,
  FieldType,
  FieldWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
  ResponseDataType,
  SearchKeywordResponseType,
  SectionTableRow,
} from "./types";

export type Section = SectionTableRow & {
  section_duplicatable_id?: string | null;
} & {
  section_field: (FieldTableRow & {
    field_option?: OptionTableRow[];
    field_response: RequestResponseTableRow[];
  })[];
};

// contains only 1 field_response per field
export type DuplicateSectionType = SectionTableRow & {
  section_duplicatable_id?: string | null;
} & {
  section_field: (FieldTableRow & {
    field_option?: OptionTableRow[];
    field_response: RequestResponseTableRow | null;
  })[];
};

export const generateDuplicateSection = (originalSection: Section) => {
  const fieldResponse: RequestResponseTableRow[] =
    originalSection.section_field.flatMap((field) => field.field_response);

  const uniqueIdList = fieldResponse.reduce((unique, item) => {
    const { request_response_duplicatable_section_id } = item;
    // Check if the item's duplicatable_section_id is already in the unique array
    const isDuplicate = unique.some((uniqueItem) =>
      uniqueItem.includes(`${request_response_duplicatable_section_id}`)
    );
    // If the item is not a duplicate, add it to the unique array
    if (!isDuplicate) {
      unique.push(`${request_response_duplicatable_section_id}`);
    }

    return unique;
  }, [] as string[]);

  const duplicateSectionList = uniqueIdList.map((id) => {
    const duplicateSection = {
      ...originalSection,
      section_field: originalSection.section_field.map((field) => ({
        ...field,
        field_response:
          field.field_response.filter(
            (response) =>
              `${response.request_response_duplicatable_section_id}` === id
          )[0] || null,
      })),
    };
    return duplicateSection;
  });

  return duplicateSectionList;
};

export const generateSectionWithDuplicateList = (
  originalSectionList: Section[]
) => {
  const sectionWithDuplicateList: DuplicateSectionType[] = [];

  originalSectionList.forEach((section) => {
    const hasDuplicates = section.section_field.some((field) =>
      field.field_response.some(
        (response) => response.request_response_duplicatable_section_id !== null
      )
    );
    if (section.section_is_duplicatable && hasDuplicates) {
      const duplicateSection = generateDuplicateSection(section);
      duplicateSection.forEach((duplicateSection) =>
        sectionWithDuplicateList.push(duplicateSection)
      );
    } else {
      const sectionWithSingleResponse = {
        ...section,
        section_field: section.section_field.map((field) => ({
          ...field,
          field_response:
            field.field_response.filter(
              (response) =>
                response.request_response_duplicatable_section_id === null
            )[0] || null,
        })),
      };
      return sectionWithDuplicateList.push(sectionWithSingleResponse);
    }
  });

  return sectionWithDuplicateList;
};

export const parseResponse = (field_type: string, responseValue: string) => {
  switch (field_type) {
    case "DATE":
      return moment(JSON.parse(responseValue)).format("MMM D, YYYY");

    default:
      return JSON.parse(responseValue);
  }
};

export const responseFieldReducer = (responseData: FieldWithResponseType) => {
  const reducedFieldWithResponse = responseData.reduce((acc, field) => {
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
        acc[responseMatchIndex].value++;
      } else {
        if (field.field_type === "MULTISELECT") {
          const responseValues = JSON.parse(response.request_response);
          responseValues.forEach((value: string) => {
            acc[acc.length] = {
              label: value,
              value: 1,
              groupId: response.request_response_duplicatable_section_id,
            };
          });
        } else {
          acc[acc.length] = {
            label: parseResponseValue,
            value: 1,
            groupId: response.request_response_duplicatable_section_id,
          };
        }
      }

      return acc;
    }, [] as ResponseDataType["responseList"]);

    const options = field.field_option.map((option) => option.option_value);

    if (index >= 0) {
      acc[index].responseList = reducedResponses;
    } else {
      acc[acc.length] = {
        id: field.field_id,
        type: field.field_type as FieldType,
        label: field.field_name,
        section_id: field.field_section_id,
        optionList: options,
        responseList: reducedResponses,
      };
    }

    return acc;
  }, [] as ResponseDataType[]);

  return reducedFieldWithResponse;
};

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

export const generateFormslyFormResponseData = (
  fieldWithResponse: FieldWithResponseType,
  reducedFieldWithResponse: ResponseDataType[],
  sectionFilter: { id: string; name: string }[]
) => {
  // get all label responses
  const itemFieldLabelList = fieldWithResponse
    .filter((field) => field.field_name === "General Name")
    .flatMap((field) => field.field_response);

  // get unique labels
  const uniqueLabels: string[] = [];
  const uniqueLabelWithDuplicateId: {
    label: string;
    duplicateId: string[];
  }[] = [];

  itemFieldLabelList.forEach((itemField) => {
    const responseLabel = JSON.parse(itemField.request_response);

    if (!uniqueLabels.includes(responseLabel)) {
      const duplicateId = itemField.request_response_duplicatable_section_id
        ? [itemField.request_response_duplicatable_section_id]
        : [];
      const newUniqueLabelWithDuplicateId = {
        label: responseLabel,
        duplicateId: duplicateId,
      };
      uniqueLabelWithDuplicateId.push(newUniqueLabelWithDuplicateId);
      uniqueLabels.push(responseLabel);
    } else {
      const labelMatchIndex = uniqueLabelWithDuplicateId.findIndex(
        (uniqueLabel) => uniqueLabel.label === responseLabel
      );
      if (labelMatchIndex) {
        const labelMatchDuplicateId =
          uniqueLabelWithDuplicateId[labelMatchIndex].duplicateId;
        const duplicateId = itemField.request_response_duplicatable_section_id;

        if (duplicateId && !labelMatchDuplicateId.includes(duplicateId)) {
          uniqueLabelWithDuplicateId[labelMatchIndex].duplicateId.push(
            duplicateId
          );
        }
      }
    }
  });

  // group responses by section

  // use item filter
  const itemFilter = sectionFilter.find((filter) => filter.name === "Item");
  const groupedFieldResponse = uniqueLabelWithDuplicateId.map((uniqueLabel) => {
    const label = uniqueLabel.label;
    const duplicateIdList = uniqueLabel.duplicateId;
    const responseMatch = reducedFieldWithResponse.map((field) => {
      const filteredResponse = field.responseList.filter((item) =>
        duplicateIdList.includes(`${item.groupId}`)
      );

      return {
        ...field,
        responseList: filteredResponse,
      };
    });

    const itemResponseData = responseMatch.filter(
      (responseItem) =>
        responseItem.responseList.length > 0 &&
        itemFilter?.id === responseItem.section_id
    );

    return {
      label,
      responseData: itemResponseData,
    };
  });

  const mainFilter = sectionFilter.find((filter) => filter.name === "Main");
  const mainResponseData =
    reducedFieldWithResponse.filter(
      (field) => mainFilter?.id === field.section_id
    ) || [];
  const mainResponse = mainFilter
    ? [
        {
          label: "Main",
          responseData: mainResponseData,
        },
      ]
    : [];

  if (groupedFieldResponse.length === 0) {
    return [];
  }

  return [...mainResponse, ...groupedFieldResponse];
};
