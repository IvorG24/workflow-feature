import { useUserProfile } from "@/stores/useUserStore";
import { responseFieldReducer } from "@/utils/arrayFunctions";
import {
  FormType,
  FormWithResponseType,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Stack } from "@mantine/core";
import { useLocalStorage, useWindowEvent } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect } from "react";
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

  const [localFormState, setLocalFormState] =
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
  const { handleSubmit, control, getValues, reset } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleCreateRequest = (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
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
    } catch (error) {
      console.log(error);
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
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
      reset({ sections: localFormState.form_section });
    } else {
      requestFormMethods.setValue("sections", form.form_section);
    }
  }, [form, localFormState, requestFormMethods, reset]);

  // save form before page reload
  useWindowEvent("beforeunload", handleBeforeUnload);

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = ""; // Required for Chrome and Firefox

    // Your custom logic here
    const formWithResponse: FormWithResponseType = {
      ...form,
      form_section: getValues("sections"),
    };
    setLocalFormState(formWithResponse);
  }

  return (
    <Container>
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
                <Box key={section.section_id + idx}>
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
            <Stack>
              <Button type="submit">Submit</Button>
              <Button variant="outline">Cancel</Button>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateRequestPage;
