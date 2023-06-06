import { getItem } from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMemberId } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
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
  options: OptionTableRow[];
  conditionalFields: Field[];
};

const CreateRequisitionRequestPage = ({
  form,
  options,
  conditionalFields,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const teamMemberId = useUserTeamMemberId();
  const team = useActiveTeam();

  const requestorProfile = useUserProfile();

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
    replace: replaceSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      setIsLoading(true);

      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId,
        teamMemberId,
        signers: form.form_signer,
      });

      notifications.show({
        title: "Success",
        message: "Request created",
        color: "green",
      });
      router.push(`/team-requests/requests/${request.request_id}`);
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
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
          field_option: options,
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
    const newFields = form.form_section[0].section_field.map((field) => {
      return {
        ...field,
        field_option: options,
      };
    });
    replaceSection({
      ...form.form_section[0],
      section_field: newFields,
    });
  }, [form, replaceSection, requestFormMethods, options]);

  const handleGeneralNameChange = async (
    index: number,
    value: string | null
  ) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const item = await getItem(supabaseClient, {
        teamId: team.team_id,
        itemName: value,
      });
      const generalField = [
        {
          ...newSection.section_field[0],
          field_description: item.item_unit,
        },
        {
          ...newSection.section_field[1],
        },
      ];
      const duplicatableSectionId = uuidv4();

      const newFields = item.item_description.map((description, fieldIndex) => {
        const field = conditionalFields.find(
          (field) => field.field_name === description.item_description_label
        );
        const options = description.item_description_field.map(
          (options, optionIndex) => {
            return {
              option_description: null,
              option_field_id: `${field?.field_id}`,
              option_id: options.item_description_field_id,
              option_order: optionIndex + 1,
              option_value: options.item_description_field_value,
            };
          }
        );
        return {
          field_description: null,
          field_id: `${field?.field_id}`,
          field_is_positive_metric: true,
          field_is_required: true,
          field_name: description.item_description_label,
          field_order: fieldIndex + 1,
          field_section_id: newSection.section_id,
          field_type: "DROPDOWN",
          field_section_duplicatable_id: duplicatableSectionId,
          field_option: options,
          field_response: "",
        };
      });

      updateSection(index, {
        ...newSection,
        section_field: [
          {
            ...generalField[0],
            field_section_duplicatable_id: duplicatableSectionId,
          },
          {
            ...generalField[1],
            field_section_duplicatable_id: duplicatableSectionId,
          },
          ...newFields,
        ],
      });
    } else {
      const generalField = [
        {
          ...newSection.section_field[0],
          field_description: null,
        },
        {
          ...newSection.section_field[1],
        },
      ];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
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
                    onRemoveSection={handleRemoveSection}
                    requisitionFormMethods={{
                      onGeneralNameChange: handleGeneralNameChange,
                    }}
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

export default CreateRequisitionRequestPage;
