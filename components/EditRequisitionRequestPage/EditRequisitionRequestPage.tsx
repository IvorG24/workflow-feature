import {
  checkIfRequestIsEditable,
  getCSICode,
  getCSICodeOptionsForItems,
  getItem,
  getProjectSignerWithTeamMember,
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
  itemOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
  specialApprover: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
};

const EditRequisitionRequestPage = ({
  request,
  itemOptions,
  projectOptions,
  specialApprover,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const specialApproverList = specialApprover.map(
    (approver) => approver.special_approver_signer.signer_id
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

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>({
    defaultValues: { sections: request_form.form_section },
  });
  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isDirty },
    setValue,
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
                newSection.section_field[2].field_response[0].request_response = `${
                  Number(newSection.section_field[2].field_response) +
                  Number(section.section_field[2].field_response)
                }`;
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
        sections: [data.sections[0], ...newSections],
      };

      const isPending = await checkIfRequestIsEditable(supabaseClient, {
        requestId: request.request_id,
      });

      if (!isPending) {
        notifications.show({
          message: "A signer reviewed your request. Request can't be edited",
          color: "red",
          autoClose: false,
        });
        router.push(`/team-requests/requests/${request.request_id}`);
        return;
      }

      const filteredSignerList = signerList.filter(
        (signer) => !specialApproverList.includes(signer.signer_id)
      );

      // special approver
      const additionalSignerList: FormType["form_signer"] = [];
      const alreadyAddedAdditionalSigner: string[] = [];
      if (specialApprover && specialApprover.length !== 0) {
        const generalNameList = newSections.map(
          (section) =>
            section.section_field[0].field_response[0].request_response
        );
        specialApprover.map((approver) => {
          if (
            alreadyAddedAdditionalSigner.includes(
              approver.special_approver_signer.signer_id
            )
          )
            return;
          if (
            approver.special_approver_item_list.some((item) =>
              generalNameList.includes(item)
            )
          ) {
            additionalSignerList.push(approver.special_approver_signer);
            alreadyAddedAdditionalSigner.push(
              approver.special_approver_signer.signer_id
            );
          }
        });
      }

      await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: newData,
        signers: [...filteredSignerList, ...additionalSignerList],
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: request_form.form_name,
      });

      notifications.show({
        message: "Request edited.",
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
    const sectionMatch = request_form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          if (field.field_name === "General Name") {
            return {
              ...field,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response_duplicatable_section_id: sectionDuplicatableId,
                request_response: "",
              })),
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: itemOptions,
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

      const csiCodeList = await getCSICodeOptionsForItems(supabaseClient, {
        divisionIdList: item.item_division_id_list,
      });

      const generalField: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
        [
          {
            ...newSection.section_field[0],
          },
          {
            ...newSection.section_field[1],
            field_response: newSection.section_field[1].field_response.map(
              (response) => ({
                ...response,
                request_response: item.item_unit,
                request_response_id: uuidv4(),
              })
            ),
          },
          {
            ...newSection.section_field[2],
          },
          {
            ...newSection.section_field[3],
            field_response: newSection.section_field[3].field_response.map(
              (response) => ({
                ...response,
                request_response: item.item_gl_account,
                request_response_id: uuidv4(),
              })
            ),
          },
          {
            ...newSection.section_field[4],
            field_response: newSection.section_field[4].field_response.map(
              (response) => ({
                ...response,
                request_response: "",
                request_response_id: uuidv4(),
              })
            ),
            field_option: csiCodeList.map((csiCode, index) => {
              return {
                option_description: null,
                option_field_id:
                  request_form.form_section[0].section_field[0].field_id,
                option_id: csiCode.csi_code_id,
                option_order: index,
                option_value: csiCode.csi_code_level_three_description,
              };
            }),
          },
          ...newSection.section_field.slice(5, 9).map((field, fieldIdx) => {
            return {
              ...field,
              field_response: newSection.section_field[
                5 + fieldIdx
              ].field_response.map((response) => ({
                ...response,
                request_response: "",
                request_response_duplicatable_section_id:
                  newSection.section_field[0].field_response[0]
                    .request_response_duplicatable_section_id,
                request_response_id: uuidv4(),
              })),
            };
          }),
          {
            ...newSection.section_field[9],
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
              option_value: `${options.item_description_field_value}${
                description.item_description_is_with_uom
                  ? ` ${options.item_description_field_uom}`
                  : ""
              }`,
            };
          }
        );

        return {
          ...description.item_field,
          field_section_duplicatable_id: duplicatableSectionId,
          field_option: options,
          field_response: [
            {
              request_response: "",
              request_response_id: uuidv4(),
              request_response_duplicatable_section_id:
                newSection.section_field[0].field_response[0]
                  .request_response_duplicatable_section_id,
              request_response_field_id: description.item_field.field_id,
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
        ] as RequestWithResponseType["request_form"]["form_section"][0]["section_field"],
      });
    } else {
      const generalField: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
        [
          ...newSection.section_field.slice(0, 3),
          ...newSection.section_field.slice(3, 9).map((field) => {
            return {
              ...field,
              field_response: [
                {
                  request_response: "",
                  request_response_duplicatable_section_id:
                    field.field_section_duplicatable_id || null,
                  request_response_field_id: field.field_id,
                  request_response_id:
                    field.field_response[0].request_response_id,
                  request_response_request_id: request.request_id,
                },
              ],
              field_option: [],
            };
          }),
          newSection.section_field[9],
        ];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
    }
  };

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const csiCode = await getCSICode(supabaseClient, { csiCode: value });

      const generalField = [
        ...newSection.section_field.slice(0, 5),
        {
          ...newSection.section_field[5],
          field_response: newSection.section_field[5].field_response.map(
            (response) => ({
              ...response,
              request_response: csiCode?.csi_code_section,
              request_response_id: uuidv4(),
            })
          ),
        },
        {
          ...newSection.section_field[6],
          field_response: newSection.section_field[6].field_response.map(
            (response) => ({
              ...response,
              request_response: csiCode?.csi_code_division_description,
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
      const newFields: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
        [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
        ];

      updateSection(index, {
        ...newSection,
        section_field: newFields,
      });
    } else {
      const generalField = [
        ...newSection.section_field.slice(0, 4),
        ...newSection.section_field.slice(4, 9).map((field) => {
          return {
            ...field,
            field_response: field.field_response.map((response) => ({
              ...response,
              request_response: "",
              request_response_id: uuidv4(),
            })),
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
        fieldId: request.request_form.form_section[1].section_field[9].field_id,
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
                    requisitionFormMethods={{
                      onGeneralNameChange: handleGeneralNameChange,
                      onProjectNameChange: handleProjectNameChange,
                      onCSICodeChange: handleCSICodeChange,
                      supplierSearch,
                      isSearching,
                    }}
                    formslyFormName="Requisition"
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

export default EditRequisitionRequestPage;
