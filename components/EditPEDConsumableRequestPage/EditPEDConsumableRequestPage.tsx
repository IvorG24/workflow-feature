import {
  checkIfRequestIsEditable,
  getConsumableItem,
  getEquipmentDescription,
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
import {
  fetchNumberFromString,
  isStringParsable,
  safeParse,
} from "@/utils/functions";
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
  itemOptions: OptionTableRow[];
  propertyNumberOptions: OptionTableRow[];
  referenceOnly: boolean;
};

const EditPEDConsumableRequestPage = ({
  request,
  projectOptions,
  itemOptions,
  propertyNumberOptions,
  referenceOnly,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const optionalFields = request.request_form.form_section[1].section_field
    .slice(0, 4)
    .map((field) => {
      return {
        ...field,
        field_response: [],
      };
    });

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
    if (
      JSON.parse(
        request_form.form_section[0].section_field[2].field_response[0]
          .request_response
      ) === "Bulk"
    ) {
      replaceSection([
        request_form.form_section[0],
        ...request_form.form_section.slice(1).map((section) => {
          return {
            ...section,
            section_field: section.section_field.slice(4),
          };
        }),
      ]);
    } else {
      replaceSection(request_form.form_section);
    }
  }, [
    request.request_form,
    replaceSection,
    requestFormMethods,
    itemOptions,
    propertyNumberOptions,
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

      const isBulk =
        JSON.parse(
          data.sections[0].section_field[2].field_response[0].request_response
        ) === "Bulk";

      let newData = data;

      if (!isBulk) {
        newData = {
          sections: [
            data.sections[0],
            ...data.sections.slice(1).map((section) => {
              return {
                ...section,
                section_field: [
                  {
                    ...section.section_field[0],
                    field_response: [
                      {
                        ...section.section_field[0].field_response[0],
                        request_response: `"${fetchNumberFromString(
                          section.section_field[0].field_response[0]
                            .request_response as string
                        )}"`,
                      },
                    ],
                  },
                  ...section.section_field.slice(1),
                ],
              };
            }),
          ],
        };
      }

      const edittedRequest = await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: newData,
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
      const response = safeParse(
        data.sections[0].section_field[0].field_response[0].request_response
      );

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const isBulk =
        JSON.parse(
          data.sections[0].section_field[2].field_response[0].request_response
        ) === "Bulk";

      let newData = formattedData;

      if (!isBulk) {
        newData = [
          formattedData[0],
          ...formattedData.slice(1).map((section) => {
            return {
              ...section,
              section_field: [
                {
                  ...section.section_field[0],
                  field_response: `${fetchNumberFromString(
                    section.section_field[0].field_response as string
                  )}`,
                },
                ...section.section_field.slice(1),
              ],
            };
          }),
        ];
      }

      const newRequest = await createRequest(supabaseClient, {
        requestFormValues: { sections: newData },
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
    const isBulk =
      safeParse(
        getValues(
          `sections.0.section_field.2.field_response.0.request_response`
        )
      ) === "Bulk";
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = request_form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field
        .slice(isBulk ? 4 : 0, 7)
        .map((field) => {
          if (field.field_name === "General Name") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: itemOptions,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response_duplicatable_section_id: sectionDuplicatableId,
                request_response: "",
              })),
            };
          } else if (field.field_name === "Equipment Property Number") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: propertyNumberOptions,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response_duplicatable_section_id: sectionDuplicatableId,
                request_response: "",
              })),
            };
          } else {
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
        });
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

  const handlePropertyNumberChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const equipmentDescription = await getEquipmentDescription(
          supabaseClient,
          {
            propertyNumber: value,
          }
        );
        const generalField = [
          newSection.section_field[0],
          {
            ...newSection.section_field[1],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_brand
                    .equipment_brand,
                request_response_duplicatable_section_id:
                  newSection.section_field[1].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[1].field_id,
              },
            ],
          },

          {
            ...newSection.section_field[2],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_model
                    .equipment_model,
                request_response_duplicatable_section_id:
                  newSection.section_field[2].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[2].field_id,
              },
            ],
          },
          {
            ...newSection.section_field[3],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_serial_number,
                request_response_duplicatable_section_id:
                  newSection.section_field[3].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[3].field_id,
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
          newSection.section_field[0],
          ...newSection.section_field.slice(1, 4).map((field) => {
            return {
              ...field,
              field_response: [
                { ...field.field_response[0], request_response: "" },
              ],
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

  const handleRequestTypeChange = async (
    prevValue: string | null,
    value: string | null
  ) => {
    const sectionList = getValues(`sections`).slice(1);
    try {
      if (value && safeParse(value) === "Bulk") {
        sectionList.forEach((section, index) => {
          const generalField = [...section.section_field.slice(4)];
          removeSection(index + 1);
          updateSection(index + 1, {
            ...section,
            section_field: generalField,
          });
        });
      } else if (prevValue && safeParse(prevValue) === "Bulk") {
        sectionList.forEach((section, index) => {
          const generalField = [...optionalFields, ...section.section_field];
          updateSection(index + 1, {
            ...section,
            section_field: generalField,
          });
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${2}.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleGeneralNameChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    const isBulk =
      safeParse(
        getValues(
          `sections.0.section_field.2.field_response.0.request_response`
        )
      ) === "Bulk";
    try {
      if (value) {
        const item = await getConsumableItem(supabaseClient, {
          teamId: team.team_id,
          itemName: value,
        });

        let generalField = [];
        if (isBulk) {
          generalField = [
            newSection.section_field[0],
            {
              ...newSection.section_field[1],
              field_response: [
                {
                  request_response_id: uuidv4(),
                  request_response: item.item_unit,
                  request_response_duplicatable_section_id:
                    newSection.section_field[1].field_section_duplicatable_id ??
                    null,
                  request_response_request_id: request.request_id,
                  request_response_field_id:
                    newSection.section_field[1].field_id,
                },
              ],
            },
            newSection.section_field[2],
          ];
        } else {
          generalField = [
            ...newSection.section_field.slice(0, 5),
            {
              ...newSection.section_field[5],
              field_response: [
                {
                  request_response_id: uuidv4(),
                  request_response: item.item_unit,
                  request_response_duplicatable_section_id:
                    newSection.section_field[5].field_section_duplicatable_id ??
                    null,
                  request_response_request_id: request.request_id,
                  request_response_field_id:
                    newSection.section_field[5].field_id,
                },
              ],
            },
            newSection.section_field[6],
          ];
        }

        const duplicatableSectionId = index === 1 ? undefined : uuidv4();

        const newFields = item.item_description.map((description) => {
          const options = description.item_description_field.map(
            (options, optionIndex) => {
              return {
                option_field_id: description.item_field.field_id,
                option_id: options.item_description_field_id,
                option_order: optionIndex + 1,
                option_value: `${options.item_description_field_value}${
                  description.item_description_is_with_uom
                    ? ` ${options.item_description_field_uom[0].item_description_field_uom}`
                    : ""
                }`,
              };
            }
          );

          const index = options.findIndex(
            (value) => value.option_value === "Any"
          );
          if (index !== -1) {
            const anyOption = options[index];
            options.splice(index, 1);
            options.unshift({ ...anyOption });
          }

          return {
            ...description.item_field,
            field_section_duplicatable_id: duplicatableSectionId,
            field_option: options,
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: index !== -1 ? "Any" : "",
                request_response_duplicatable_section_id:
                  duplicatableSectionId ?? null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[1].field_id,
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
        let generalField = [];
        if (isBulk) {
          generalField = [
            newSection.section_field[0],
            {
              ...newSection.section_field[1],
              field_response: [],
            },
            newSection.section_field[2],
          ];
        } else {
          generalField = [
            ...newSection.section_field.slice(0, 5),
            {
              ...newSection.section_field[5],
              field_response: [
                {
                  ...newSection.section_field[5].field_response[0],
                  request_response: "",
                },
              ],
            },
            newSection.section_field[6],
          ];
        }
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.4.field_response`, []);
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
                    pedConsumableFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onPropertyNumberChange: handlePropertyNumberChange,
                      onRequestTypeChange: handleRequestTypeChange,
                      onGeneralNameChange: handleGeneralNameChange,
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

export default EditPEDConsumableRequestPage;
