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
      return moment(responseValue).format("MMM D, YYYY");

    default:
      return JSON.parse(responseValue);
  }
};

export const responseFieldReducer = (response: FieldWithResponseType) => {
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

export const searchResponseReducer = (data: SearchKeywordResponseType[]) => {
  return data.reduce((acc, item) => {
    const existingItem = acc.find(
      (x) => x.id === item.request_response_field_id
    );
    const label = item.response_field.field_name;
    const parseResponse = JSON.parse(item.request_response);
    const responseItem = { label: parseResponse, count: 1 };

    if (existingItem) {
      const duplicateResponseIndex = existingItem.responseList.findIndex(
        (d) => d.label === parseResponse
      );
      if (duplicateResponseIndex >= 0) {
        existingItem.responseList[duplicateResponseIndex].count++;
      } else {
        existingItem.responseList.push(responseItem);
      }
    } else {
      const newItem: ResponseDataType[0] = {
        id: item.request_response_field_id,
        type: item.response_field.field_type as FieldType,
        label,
        optionList: [],
        responseList: [responseItem],
      };
      acc[acc.length] = newItem;
    }
    return acc;
  }, [] as ResponseDataType);
};
