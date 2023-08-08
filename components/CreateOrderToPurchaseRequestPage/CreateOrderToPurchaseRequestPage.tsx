import { getItem } from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
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
  itemOptions: OptionTableRow[];
  otpIdSection?: RequestFormValues["sections"][0];
};

const CreateOrderToPurchaseRequestPage = ({
  form,
  itemOptions,
  otpIdSection,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
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
      if (!teamMember) return;

      setIsLoading(true);

      const toBeCheckedSections = data.sections.slice(1);
      const newSections: RequestFormValues["sections"] = [];
      toBeCheckedSections.forEach((section) => {
        // if new section if empty
        if (newSections.length === 0) {
          newSections.push(section);
        } else {
          let uniqueItem = true;
          newSections.forEach((newSection) => {
            // if section general name is equal
            if (
              newSection.section_field[0].field_response ===
              section.section_field[0].field_response
            ) {
              let uniqueField = false;
              // loop on every field except name and quantity
              for (let i = 5; i < newSection.section_field.length; i++) {
                if (
                  newSection.section_field[i].field_response !==
                  section.section_field[i].field_response
                ) {
                  uniqueField = true;
                  break;
                }
              }
              if (!uniqueField) {
                newSection.section_field[2].field_response =
                  Number(newSection.section_field[2].field_response) +
                  Number(section.section_field[2].field_response);
                uniqueItem = false;
              }
            }
          });
          if (uniqueItem) {
            newSections.push(section);
          }
        }
      });

      const newData = {
        sections: [
          otpIdSection as RequestFormValues["sections"][0],
          data.sections[0],
          ...newSections,
        ],
      };

      const request = await createRequest(supabaseClient, {
        requestFormValues: newData,
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: form.form_signer,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
      });

      notifications.show({
        message: "Request created.",
        color: "green",
      });
      router.push(`/team-requests/requests/${request.request_id}`);
    } catch (error) {
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
          field_option: itemOptions,
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
    const newFields = form.form_section[1].section_field.map((field) => {
      return {
        ...field,
        field_option: itemOptions,
      };
    });
    replaceSection([
      {
        ...form.form_section[0],
      },
      {
        ...form.form_section[1],
        section_field: newFields,
      },
    ]);
  }, [form, replaceSection, requestFormMethods, itemOptions]);

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
        },
        {
          ...newSection.section_field[1],
          field_response: item.item_unit,
        },
        {
          ...newSection.section_field[2],
        },
        {
          ...newSection.section_field[3],
          field_response: item.item_cost_code,
        },
        {
          ...newSection.section_field[4],
          field_response: item.item_gl_account,
        },
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      const newFields = item.item_description.map((description) => {
        const options = description.item_description_field.map(
          (options, optionIndex) => {
            return {
              option_description: null,
              option_field_id: description.item_field.field_id,
              option_id: options.item_description_field_id,
              option_order: optionIndex + 1,
              option_value: options.item_description_field_value,
            };
          }
        );

        return {
          ...description.item_field,
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
          {
            ...generalField[2],
            field_section_duplicatable_id: duplicatableSectionId,
          },
          {
            ...generalField[3],
            field_section_duplicatable_id: duplicatableSectionId,
          },
          {
            ...generalField[4],
            field_section_duplicatable_id: duplicatableSectionId,
          },
          ...newFields,
        ],
      });
    } else {
      const generalField = [
        ...newSection.section_field.slice(0, 3),
        {
          ...newSection.section_field[3],
          field_response: "",
        },
        {
          ...newSection.section_field[4],
          field_response: "",
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
                    orderToPurchaseFormMethods={{
                      onGeneralNameChange: handleGeneralNameChange,
                    }}
                    formslyFormName="Order to Purchase"
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

export default CreateOrderToPurchaseRequestPage;
