import {
  checkIfRequestIsEditable,
  getEquipmentName,
  getEquipmentSectionChoices,
  getProjectSignerWithTeamMember,
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
  categoryOptions: OptionTableRow[];
  referenceOnly: boolean;
};

const EditPEDEquipmentRequestPage = ({
  request,
  projectOptions,
  categoryOptions,
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

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
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

  useEffect(() => {
    replaceSection(request_form.form_section);
  }, [
    request.request_form,
    replaceSection,
    requestFormMethods,
    categoryOptions,
    request_form.form_section,
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
        formName: request_form.form_name,
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

      const response = JSON.parse(
        data.sections[0].section_field[0].field_response[0].request_response
      );

      const projectId = data.sections[0].section_field[0].field_option.find(
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
    const sectionMatch = request_form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => ({
          ...field,
          field_section_duplicatable_id: sectionDuplicatableId,
          field_response: [],
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

  const handleRemoveSection = (sectionMatchIndex: number) =>
    removeSection(sectionMatchIndex);

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
      setValue(`sections.0.section_field.0.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handleCategoryChange = async (value: string | null, index: number) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const categoryId = categoryOptions.find(
          (category) => category.option_value === value
        );
        if (!categoryId) return;
        const equipmentName = await getEquipmentName(supabaseClient, {
          category: categoryId.option_id,
        });

        const generalField = [
          {
            ...newSection.section_field[0],
          },
          {
            ...newSection.section_field[1],
            field_response: [],
            field_option: equipmentName.map((equipment, index) => {
              return {
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: equipment.equipment_id,
                option_order: index,
                option_value: equipment.equipment_name,
              };
            }),
          },
          ...newSection.section_field.slice(2, 4).map((field) => {
            return {
              ...field,
              field_response: [],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(4),
        ];

        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          {
            ...newSection.section_field[0],
            field_response: [],
          },
          ...newSection.section_field.slice(1, 4).map((field) => {
            return {
              ...field,
              field_response: [],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(4),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${0}.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleEquipmentNameChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const brandChoices = await getEquipmentSectionChoices(supabaseClient, {
          category: newSection.section_field[0].field_response[0]
            .request_response as string,
          equipmentName: value,
        });

        const generalField = [
          ...newSection.section_field.slice(0, 2),
          {
            ...newSection.section_field[2],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: "ANY",
                request_response_duplicatable_section_id:
                  newSection.section_field[2].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[2].field_id,
              },
            ],
            field_option: [
              {
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: uuidv4(),
                option_order: index,
                option_value: "ANY",
              },
              ...brandChoices.map((equipment, index) => {
                const formattedChoice = equipment as {
                  equipment_description_brand: {
                    equipment_brand: string;
                  };
                };
                return {
                  option_field_id:
                    request_form.form_section[0].section_field[0].field_id,
                  option_id:
                    formattedChoice.equipment_description_brand.equipment_brand,
                  option_order: index,
                  option_value:
                    formattedChoice.equipment_description_brand.equipment_brand,
                };
              }),
            ],
          },
          {
            ...newSection.section_field[3],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: "ANY",
                request_response_duplicatable_section_id:
                  newSection.section_field[3].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[3].field_id,
              },
            ],
            field_option: [
              {
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: uuidv4(),
                option_order: index,
                option_value: "ANY",
              },
            ],
          },
          ...newSection.section_field.slice(4),
        ];

        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 2),
          ...newSection.section_field.slice(2, 4).map((field) => {
            return {
              ...field,
              field_response: [],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(4),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.1.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleBrandChange = async (value: string | null, index: number) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const modelChoices = await getEquipmentSectionChoices(supabaseClient, {
          category: newSection.section_field[0].field_response[0]
            .request_response as string,
          equipmentName: newSection.section_field[1].field_response[0]
            .request_response as string,
          brand: value,
        });

        const generalField = [
          ...newSection.section_field.slice(0, 3),
          {
            ...newSection.section_field[3],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: "ANY",
                request_response_duplicatable_section_id:
                  newSection.section_field[3].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[3].field_id,
              },
            ],
            field_option: [
              {
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: uuidv4(),
                option_order: index,
                option_value: "ANY",
              },
              ...modelChoices.map((equipment, index) => {
                const formattedChoice = equipment as {
                  equipment_description_model: {
                    equipment_model: string;
                  };
                };
                return {
                  option_field_id:
                    request_form.form_section[0].section_field[0].field_id,
                  option_id:
                    formattedChoice.equipment_description_model.equipment_model,
                  option_order: index,
                  option_value:
                    formattedChoice.equipment_description_model.equipment_model,
                };
              }),
            ],
          },
          ...newSection.section_field.slice(4),
        ];

        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 3),
          {
            ...newSection.section_field[3],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: "ANY",
                request_response_duplicatable_section_id:
                  newSection.section_field[3].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[3].field_id,
              },
            ],
            field_option: [
              {
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: uuidv4(),
                option_order: index,
                option_value: "ANY",
              },
            ],
          },

          ...newSection.section_field.slice(4),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.2.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
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
                    pedEquipmentFormMethods={{
                      onCategoryChange: handleCategoryChange,
                      onProjectNameChange: handleProjectNameChange,
                      onEquipmentNameChange: handleEquipmentNameChange,
                      onBrandChange: handleBrandChange,
                    }}
                    formslyFormName={request_form.form_name}
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
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditPEDEquipmentRequestPage;
