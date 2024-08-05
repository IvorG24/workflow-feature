import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Database } from "oneoffice-api";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

export type Section = FormWithResponseType["form_section"][0];
export type Field = FormType["form_section"][0]["section_field"][0];

export type RequestFormValues = {
  sections: Section[];
};

export type FieldWithResponseArray = Field & {
  field_response: RequestResponseTableRow[];
};

type Props = {
  form: FormType;
};

const CreateHRPage = ({ form }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const { setIsLoading } = useLoadingActions();

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
    update: updateSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    replaceSection(form.form_section);
  }, [form, replaceSection, requestFormMethods]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);
      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId: form.form_id,
        signers: form.form_signer,
        teamId: "a5a28977-6956-45c1-a624-b9e90911502e",
        requesterName: `TEMP`,
        formName: form.form_name,
        isFormslyForm: false,
        projectId: "",
        teamName: formatTeamNameToUrlKey(
          process.env.NODE_ENV === "production" ? "SCIC" : "Sta Clara"
        ),
        formDepartment: formatTeamNameToUrlKey("HR"),
      });
      notifications.show({
        message: "Request created.",
        color: "green",
      });
      console.log(`/public-request/${request.request_id}`);
      await router.push(`/public-request/${request.request_id}`);
    } catch (e) {
      console.log(e);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
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
      if (formSections[sectionMatchIndex].section_field[0].field_response) {
        const option = formSections[
          sectionMatchIndex
        ].section_field[0].field_option.find(
          (fieldOption) =>
            fieldOption.option_value ===
            formSections[sectionMatchIndex].section_field[0].field_response
        ) as OptionTableRow;

        if (option) {
          const sectionList = getValues(`sections`);
          const itemSectionList = sectionList.slice(1);

          itemSectionList.forEach((section, sectionIndex) => {
            sectionIndex += 1;
            if (sectionIndex !== sectionMatchIndex) {
              updateSection(sectionIndex, {
                ...section,
                section_field: [
                  {
                    ...section.section_field[0],
                    field_option: [
                      ...section.section_field[0].field_option,
                      option,
                    ].sort((a, b) => {
                      return a.option_order - b.option_order;
                    }),
                  },
                  ...section.section_field.slice(1),
                ],
              });
            }
          });
        }
      }

      removeSection(sectionMatchIndex);
      return;
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
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
                    formslyFormName={form.form_name}
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

export default CreateHRPage;
