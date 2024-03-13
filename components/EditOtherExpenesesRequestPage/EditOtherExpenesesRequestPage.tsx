import {
  checkIfRequestIsEditable,
  getCSICode,
  getProjectSignerWithTeamMember,
  getSupplier,
  getTypeOptions,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { isStringParsable } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
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
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { RequestFormValues } from "../EditRequestPage/EditRequestPage";

export type RequestFormValuesForReferenceRequest = {
  sections: FormWithResponseType["form_section"];
};

type Props = {
  request: RequestWithResponseType;
  projectOptions: OptionTableRow[];
  referenceOnly: boolean;
};

const EditOtherExpensesRequestPage = ({
  request,
  projectOptions,
  referenceOnly,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

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

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
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
  }, [
    request.request_form,
    replaceSection,
    requestFormMethods,
    form.form_section,
  ]);

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const isPending = await checkIfRequestIsEditable(supabaseClient, {
        requestId: request.request_id,
      });

      if (!isPending) {
        notifications.show({
          message: "A signer reviewed your request. Request can't be edited",
          color: "red",
          autoClose: false,
        });
        router.push(
          `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
            request.request_formsly_id_prefix
          }-${request.request_formsly_id_serial}`
        );
        return;
      }

      const edittedRequest = await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: data,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
        teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
      });

      notifications.show({
        message: "Request edited.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          edittedRequest.request_formsly_id_prefix
        }-${edittedRequest.request_formsly_id_serial}`
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

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);
      const formattedData = data.sections.map((section, index) => {
        const duplicatableId = uuidv4();
        return {
          ...section,
          section_field: section.section_field.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id:
                index > 1 ? duplicatableId : undefined,
              field_response: isStringParsable(
                field.field_response[0].request_response
              )
                ? JSON.parse(field.field_response[0].request_response)
                : field.field_response[0].request_response ?? undefined,
            };
          }),
        };
      });

      const response = formattedData[0].section_field[0]
        .field_response as string;

      const projectId = formattedData[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const newRequest = await createRequest(supabaseClient, {
        requestFormValues: { sections: formattedData },
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: request.request_form.form_name,
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
          newRequest.request_formsly_id_prefix
        }-${newRequest.request_formsly_id_serial}`
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
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = request.request_form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          return {
            ...field,
            field_response: field.field_response.map((response) => ({
              ...response,
              request_response_duplicatable_section_id: sectionDuplicatableId,
              request_response: "",
            })),
            field_section_duplicatable_id: sectionDuplicatableId,
          };
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

  const handleRemoveSection = (sectionMatchIndex: number) =>
    removeSection(sectionMatchIndex);

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const csiCode = await getCSICode(supabaseClient, { csiCode: value });

      const generalField = [
        ...newSection.section_field.slice(0, 6),
        {
          ...newSection.section_field[6],
          field_response: newSection.section_field[6].field_response.map(
            (response) => ({
              ...response,
              request_response: csiCode?.csi_code_section,
              request_response_id: uuidv4(),
            })
          ),
        },
        {
          ...newSection.section_field[7],
          field_response: newSection.section_field[7].field_response.map(
            (response) => ({
              ...response,
              request_response:
                csiCode?.csi_code_level_two_major_group_description,
              request_response_id: uuidv4(),
            })
          ),
        },
        {
          ...newSection.section_field[8],
          field_response: newSection.section_field[8].field_response.map(
            (response) => ({
              ...response,
              request_response:
                csiCode?.csi_code_level_two_minor_group_description,
              request_response_id: uuidv4(),
            })
          ),
        },
        ...newSection.section_field.slice(9),
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      updateSection(index, {
        ...newSection,
        section_field: [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
        ],
      });
    } else {
      const generalField = [
        ...newSection.section_field.slice(0, 6),
        ...newSection.section_field.slice(6, 9).map((field) => {
          return {
            ...field,
            field_response: [
              { ...field.field_response[0], request_response: "" },
            ],
          };
        }),
        ...newSection.section_field.slice(9),
      ];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
    }
  };
  const resetSigner = () => {
    setSignerList(initialSignerList);
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

  const supplierSearch = async (value: string, index: number) => {
    if (!teamMember?.team_member_team_id) return;
    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value ?? "",
        teamId: teamMember.team_member_team_id,
        fieldId: form.form_section[1].section_field[9].field_id,
      });
      setValue(`sections.${index}.section_field.9.field_option`, supplierList);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const categoryId = newSection.section_field[0].field_option.find(
        (option) => option.option_value === value
      )?.option_id;
      if (!categoryId) return;

      const data = await getTypeOptions(supabaseClient, {
        categoryId: categoryId,
      });

      const typeOptions = data.map((type) => {
        return {
          option_field_id: form.form_section[1].section_field[0].field_id,
          option_id: type.other_expenses_type_id,
          option_order: index,
          option_value: type.other_expenses_type,
        };
      });

      const generalField = [
        newSection.section_field[0],
        {
          ...newSection.section_field[1],
          field_option: typeOptions,
        },
        ...newSection.section_field.slice(2),
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      updateSection(index, {
        ...newSection,
        section_field: [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
        ],
      });
    } else {
      const generalField = [
        newSection.section_field[0],
        {
          ...newSection.section_field[1],
          field_response: [],
          field_option: [],
        },
        ...newSection.section_field.slice(2),
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
        {referenceOnly ? "Reference" : "Edit"} Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form
          onSubmit={handleSubmit(
            referenceOnly ? handleCreateRequest : handleEditRequest
          )}
        >
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
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
                    otherExpensesMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onCSICodeChange: handleCSICodeChange,
                      onCategoryChange: handleCategoryChange,
                      supplierSearch,
                      isSearching,
                    }}
                    formslyFormName={form.form_name}
                    referenceOnly={referenceOnly}
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
              <Button
                variant="outline"
                color="red"
                onClick={() => replaceSection(form.form_section)}
              >
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditOtherExpensesRequestPage;
