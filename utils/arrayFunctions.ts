import {
  FieldWithResponseArray,
  RequestFormValues,
} from "@/components/CreateRequestPage/CreateRequestPage";
import { v4 as uuidv4 } from "uuid";
import { RequestResponseTableRow } from "./types";

export const responseFieldReducer = (
  responseSection: RequestFormValues,
  requestId: string
) => {
  const updatedSectionListWithResponse = responseSection.sections.map(
    (section) => {
      const sectionFields = section.section_field.map((field) => {
        const response: RequestResponseTableRow = {
          request_response_id: uuidv4(),
          request_response: field.field_response
            ? `${field.field_response}`
            : "",
          request_response_duplicatable_section_id:
            field.field_section_duplicatable_id ?? null,
          request_response_field_id: field.field_id,
          request_response_request_id: requestId,
        };

        return {
          ...field,
          field_response: field.field_response ? response : null,
        };
      });

      return { ...section, section_field: sectionFields };
    }
  );

  const fieldWithReponse = updatedSectionListWithResponse.flatMap(
    (section) => section.section_field
  );

  const mergedFields = fieldWithReponse.reduce((result, field) => {
    const existingField = result.find((f) => f.field_id === field.field_id);
    if (existingField) {
      const existingFieldResponseIds = new Set(
        existingField.field_response.map(
          (response) => response.request_response_id
        )
      );
      if (
        field.field_response &&
        !existingFieldResponseIds.has(field.field_response.request_response_id)
      ) {
        existingField.field_response.push(field.field_response);
      }
    } else {
      result.push({
        ...field,
        field_response: field.field_response ? [field.field_response] : [],
      });
    }

    return result;
  }, [] as FieldWithResponseArray[]);

  return mergedFields;
};
