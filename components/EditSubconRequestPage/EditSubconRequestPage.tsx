import {
  checkIfRequestIsEditable,
  getProjectSignerWithTeamMember,
  getService,
  getSupplier,
} from "@/backend/api/get";
import { editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey, parseJSONIfValid } from "@/utils/string";
import {
  FormType,
  OptionTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { RequestFormValues } from "../EditRequestPage/EditRequestPage";

type Props = {
  request: RequestWithResponseType;
  serviceOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
};

const EditSubconRequestPage = ({
  request,
  serviceOptions,
  projectOptions,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const [subconOption, setSubconOption] = useState<OptionTableRow[]>(
    request.request_form.form_section[0].section_field[5].field_option
  );
  const initialSignerList: FormType["form_signer"] = request.request_signer
    .map((signer) => signer.request_signer_signer)
    .map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
      signer_team_member: {
        ...signer.signer_team_member,
        team_member_user: {
          ...signer.signer_team_member.team_member_user,
          user_id: signer.signer_team_member.team_member_user.user_id,
          user_avatar: "",
        },
      },
    }));

  const [signerList, setSignerList] = useState(initialSignerList);
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const { request_form: form } = request;
  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>({
    defaultValues: { sections: form.form_section },
  });
  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isDirty },
  } = requestFormMethods;

  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      const teamNameUrlKey = formatTeamNameToUrlKey(team.team_name ?? "");

      setIsLoading(true);

      const isPending = await checkIfRequestIsEditable(supabaseClient, {
        requestId: request.request_id,
      });

      if (!isPending) {
        notifications.show({
          message: "Request can't be edited",
          color: "red",
        });
        router.push(`/${teamNameUrlKey}/requests/${request.request_id}`);
        return;
      }

      await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: data,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
        teamName: teamNameUrlKey,
      });

      notifications.show({
        message: "Request edited.",
        color: "green",
      });

      router.push(`/${teamNameUrlKey}/requests/${request.request_id}`);
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
      const duplicatedFieldsWithDuplicatableId = [
        sectionMatch.section_field[0],
      ].map((field) => ({
        ...field,
        field_response: field.field_response.map((response) => ({
          ...response,
          request_response_duplicatable_section_id: sectionDuplicatableId,
          request_response: "",
        })),
        field_section_duplicatable_id: sectionDuplicatableId,
        field_option: serviceOptions,
      }));
      const newSection = {
        ...sectionMatch,
        section_field: duplicatedFieldsWithDuplicatableId,
      };
      addSection(sectionLastIndex + 1, newSection);
      return;
    }
  };

  const handleRemoveSection = (sectionMatchIndex: number) =>
    removeSection(sectionMatchIndex);

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
          field_response: [
            {
              request_response: "",
              request_response_id: uuidv4(),
              request_response_duplicatable_section_id:
                newSection.section_field[0].field_response[0]
                  .request_response_duplicatable_section_id,
              request_response_field_id: scope.service_field.field_id,
              request_response_request_id: request.request_id,
            },
          ],
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
            setSignerList(initialSignerList);
          }
        }
      } else {
        setSignerList(initialSignerList);
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
      value ===
        parseJSONIfValid(
          getValues(
            "sections.1.section_field.0.field_response.0.request_response"
          )
        )
    )
      return;

    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value,
        teamId: `${teamMember?.team_member_team_id}`,
        fieldId: form.form_section[1].section_field[0].field_id,
      });
      const prevChosenSupplier = parseJSONIfValid(
        getValues(
          `sections.0.section_field.5.field_response.0.request_response`
        )
      ) as string[];
      const prevSupplierList = subconOption.filter((option) =>
        prevChosenSupplier.includes(option.option_value)
      );
      setSubconOption([...prevSupplierList, ...supplierList]);
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
        Edit Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleEditRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionService) => sectionService.section_id)
                .lastIndexOf(sectionIdToFind);
              const isRemovable =
                formSections[idx - 1]?.section_is_duplicatable &&
                section.section_is_duplicatable;
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    isSectionRemovable={isRemovable}
                    formslyFormName={form.form_name}
                    subconFormMethods={{
                      onServiceNameChange: handleServiceNameChange,
                      onProjectNameChange: handleProjectNameChange,
                      subconSearch: subconSearch,
                      subconOption: subconOption,
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
            <Flex direction="column" gap="sm">
              {isDirty && (
                <Button variant="outline" color="red" onClick={() => reset()}>
                  Reset
                </Button>
              )}
              <Button type="submit" disabled={!isDirty}>
                Submit
              </Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditSubconRequestPage;
