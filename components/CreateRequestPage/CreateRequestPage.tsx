import { useUserProfile } from "@/stores/useUserStore";
import { responseFieldReducer } from "@/utils/arrayFunctions";
import {
  FormType,
  FormWithResponseType,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, LoadingOverlay, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import RequestFormDetails from "./RequestFormDetails";
import RequestFormSection from "./RequestFormSection";
import RequestFormSigner from "./RequestFormSigner";

export type Section = FormWithResponseType["form_section"][0];

export type RequestFormValues = {
  sections: Section[];
};

type CreateRequestPageProps = {
  form: FormType;
};

export type FieldWithResponseArray =
  FormType["form_section"][0]["section_field"][0] & {
    field_response: RequestResponseTableRow[];
  };

const CreateRequestPage = ({ form }: CreateRequestPageProps) => {
  const router = useRouter();
  const requestorProfile = useUserProfile();
  const [isSubmittingForm, setIsSubmmittingForm] = useState(false);

  const [localFormState, setLocalFormState, removeLocalFormState] =
    useLocalStorage<FormWithResponseType | null>({
      key: `${router.query.formId}`,
      defaultValue: form,
    });

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };
  const signerList = form.form_signer.map((signer) => ({
    ...signer,
    signer_action: signer.signer_action.toUpperCase(),
  }));

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });
  const handleCreateRequest = (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      setIsSubmmittingForm(true);
      const dummyRequestId = uuidv4();
      const formId = router.query.formId;
      const reducedData = responseFieldReducer(data, dummyRequestId);
      const updatedSectionList = form.form_section.map((section) => {
        const fields = reducedData.filter(
          (f) => f.field_section_id === section.section_id
        );
        const updatedSection = { ...section, section_field: fields };

        return updatedSection;
      });
      const newRequest = {
        request_form: {
          formId: formId,
          form_name: form.form_name,
          form_description: form.form_description,
          form_section: updatedSectionList,
        },
        request_team_member: {
          team_member_user: {
            user_id: requestorProfile.user_id,
            user_first_name: requestorProfile.user_first_name,
            user_last_name: requestorProfile.user_last_name,
            user_username: requestorProfile.user_username,
            user_avatar: requestorProfile.user_avatar as string,
          },
        },
        request_signer: form.form_signer.map((signer) => ({
          request_signer_id: uuidv4(),
          request_signer_status: "PENDING",
          request_signer_signer: signer,
        })),
        request_comment: [],
      };
      console.log(newRequest);
      removeLocalFormState();
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsSubmmittingForm(false);
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => ({
          ...field,
          field_section_duplicatable_id: sectionDuplicatableId,
        })
      );
      const newSection = {
        ...sectionMatch,
        section_field: duplicatedFieldsWithDuplicatableId,
      };
      addSection(sectionLastIndex + 1, newSection);
      return;
    }
  };

  const handleRemoveSection = (sectionDuplicatableId: string) => {
    const sectionMatchIndex = formSections.findIndex(
      (section) =>
        section.section_field[0].field_section_duplicatable_id ===
        sectionDuplicatableId
    );
    if (sectionMatchIndex) {
      removeSection(sectionMatchIndex);
      return;
    }
  };

  useEffect(() => {
    if (localFormState) {
      replaceSection(localFormState.form_section);
    } else {
      replaceSection(form.form_section);
    }
  }, [form, localFormState, replaceSection, requestFormMethods]);

  useBeforeunload(() => {
    const formWithResponse: FormWithResponseType = {
      ...form,
      form_section: getValues("sections"),
    };
    setLocalFormState(formWithResponse);
  });

  return (
    <Container>
      <LoadingOverlay visible={isSubmittingForm} overlayBlur={2} />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              // used to render add duplicate button
              // find the last index of current section, and render add duplicate button if match
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                  />
                  {section.section_is_duplicatable &&
                    idx === sectionLastIndex && (
                      <Button
                        mt="md"
                        variant="default"
                        onClick={() =>
                          handleDuplicateSection(section.section_id)
                        }
                        fullWidth
                      >
                        {section.section_name} +
                      </Button>
                    )}
                </Box>
              );
            })}
            <RequestFormSigner signerList={signerList} />
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateRequestPage;
