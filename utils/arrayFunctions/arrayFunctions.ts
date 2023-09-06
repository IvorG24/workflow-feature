import {
  DuplicateSectionType,
  FormTableRow,
  RequestResponseTableRow,
  RequestWithResponseType,
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

export const areEqual = (array1: string[], array2: string[]) => {
  if (array1.length === array2.length) {
    return array1.every((element) => {
      if (array2.includes(element)) {
        return true;
      }
      return false;
    });
  }
  return false;
};

export const sortFormList = (
  formList: FormTableRow[],
  formslyFormSortingReferrence: string[]
): FormTableRow[] => {
  return formList.sort((formA, formB) => {
    // Check if form_is_formsly_form is different
    if (formA.form_is_formsly_form !== formB.form_is_formsly_form) {
      return formA.form_is_formsly_form ? -1 : 1;
    }

    // If both forms have the same form_is_formsly_form value, sort them based on form_name
    const indexA = formslyFormSortingReferrence.indexOf(formA.form_name);
    const indexB = formslyFormSortingReferrence.indexOf(formB.form_name);

    // If both form names are in the reference array, compare their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one form name is in the reference array, the one in the reference comes first
    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }

    // If neither form name is in the reference array, keep their original order
    return 0;
  });
};

export const generateRequestDuplicateSection = (
  originalSection: RequestWithResponseType["request_form"]["form_section"][0]
) => {
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
    const duplicateSection: RequestWithResponseType["request_form"]["form_section"][0] =
      {
        ...originalSection,
        section_field: originalSection.section_field.map((field) => ({
          ...field,
          field_response: [
            field.field_response.filter(
              (response) =>
                `${response.request_response_duplicatable_section_id}` === id
            )[0] || null,
          ],
        })),
      };
    return duplicateSection;
  });

  return duplicateSectionList;
};

export const parseRequest = (request: RequestWithResponseType) => {
  const {
    request_form: { form_section: originalSectionList },
  } = request;
  const sectionWithDuplicateList: RequestWithResponseType["request_form"]["form_section"] =
    [];

  originalSectionList.forEach((section) => {
    const hasDuplicates = section.section_field.some((field) =>
      field.field_response.some(
        (response) => response.request_response_duplicatable_section_id !== null
      )
    );
    if (section.section_is_duplicatable && hasDuplicates) {
      const duplicateSection = generateRequestDuplicateSection(section);
      duplicateSection.forEach((duplicateSection) =>
        sectionWithDuplicateList.push(duplicateSection)
      );
    } else {
      sectionWithDuplicateList.push(section);
    }
  });

  const returnData: RequestWithResponseType = {
    ...request,
    request_form: {
      ...request.request_form,
      form_section: sectionWithDuplicateList,
    },
  };

  return returnData;
};
