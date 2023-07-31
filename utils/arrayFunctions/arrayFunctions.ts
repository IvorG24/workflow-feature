import {
  DuplicateSectionType,
  RequestResponseTableRow,
  Section,
} from "../types";

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

export const checkIfTwoArrayHaveAtLeastOneEqualElement = (
  firstArray: string[],
  secondArray: string[]
) => {
  let returnValue = false;
  for (const firstArrayValue of firstArray) {
    if (secondArray.includes(firstArrayValue)) {
      returnValue = true;
      break;
    }
  }
  return returnValue;
};
