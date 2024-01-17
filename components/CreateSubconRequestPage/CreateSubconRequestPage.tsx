import {
  getProjectSignerWithTeamMember,
  getService,
  getSupplier,
} from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  LoadingOverlay,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  serviceOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
};

const CreateSubconRequestPage = ({
  form,
  serviceOptions,
  projectOptions,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
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

      const response = data.sections[0].section_field[0]
        .field_response as string;

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
        isFormslyForm: true,
        projectId,
        teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
      });

      notifications.show({
        message: "Request created.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          request.request_id
        }`
      );
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
      .map((sectionService) => sectionService.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          if (field.field_name === "Service Name") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: serviceOptions,
            };
          } else {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        }
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
      if (field.field_name === "Service Name") {
        return {
          ...field,
          field_option: serviceOptions,
        };
      } else {
        return field;
      }
    });
    replaceSection([
      form.form_section[0],
      {
        ...form.form_section[1],
        section_field: newFields,
      },
    ]);
  }, [form, replaceSection, requestFormMethods, serviceOptions]);

  const handleServiceNameChange = async (
    index: number,
    value: string | null
  ) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const service = await getService(supabaseClient, {
        teamId: team.team_id,
        serviceName: value,
      });
      const generalField = [
        {
          ...newSection.section_field[0],
        },
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      const newFields = service.service_scope.map((scope) => {
        const options = scope.service_scope_choice.map(
          (options, optionIndex) => {
            return {
              option_field_id: scope.service_field.field_id,
              option_id: options.service_scope_choice_id,
              option_order: optionIndex + 1,
              option_value: options.service_scope_choice_name,
            };
          }
        );

        return {
          ...scope.service_field,
          field_section_duplicatable_id: duplicatableSectionId,
          field_option: options,
          field_response: "",
        };
      });

      updateSection(index, {
        ...newSection,
        section_field: [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
          ...newFields,
        ],
      });
    } else {
      const generalField = [newSection.section_field[0]];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
    }
  };

  const resetSigner = () => {
    setSignerList(
      form.form_signer.map((signer) => ({
        ...signer,
        signer_action: signer.signer_action.toUpperCase(),
      }))
    );
  };

  const handleProjectNameChange = async (value: string | null) => {
    try {
      setIsFetchingSigner(true);
      if (value) {
        const projectId = projectOptions.find(
          (option) => option.option_value === value
        )?.option_id;
        if (projectId) {
          const data = await getProjectSignerWithTeamMember(supabaseClient, {
            projectId,
            formId,
          });
          if (data.length !== 0) {
            setSignerList(data as unknown as FormType["form_signer"]);
          } else {
            resetSigner();
          }
        }
      } else {
        resetSigner();
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const subconSearch = async (value: string) => {
    if (
      !value ||
      value === getValues("sections.1.section_field.0.field_response")
    )
      return;

    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value,
        teamId: `${teamMember?.team_member_team_id}`,
        fieldId: form.form_section[1].section_field[0].field_id,
      });
      const prevChosenSupplier = getValues(
        `sections.0.section_field.5.field_response`
      ) as string[];
      const prevSupplierList = getValues(
        `sections.0.section_field.5.field_option`
      ).filter((option) => prevChosenSupplier.includes(option.option_value));

      setValue(`sections.0.section_field.5.field_option`, [
        ...prevSupplierList,
        ...supplierList,
      ]);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSearching(false);
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
                .map((sectionService) => sectionService.section_id)
                .lastIndexOf(sectionIdToFind);

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    formslyFormName="Subcon"
                    subconFormMethods={{
                      onServiceNameChange: handleServiceNameChange,
                      onProjectNameChange: handleProjectNameChange,
                      subconSearch: subconSearch,
                      isSearching: isSearching,
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
            <Box pos="relative">
              <LoadingOverlay visible={isFetchingSigner} overlayBlur={2} />
              <RequestFormSigner signerList={signerList} />
            </Box>
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateSubconRequestPage;
