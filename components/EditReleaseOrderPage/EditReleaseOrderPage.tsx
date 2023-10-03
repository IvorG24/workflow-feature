import {
  checkIfRequestIsPending,
  checkROItemQuantity,
} from "@/backend/api/get";
import { editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { parseJSONIfValid, regExp } from "@/utils/string";
import {
  FormType,
  OptionTableRow,
  RequestResponseTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  List,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { RequestFormValues } from "../EditRequestPage/EditRequestPage";

export type Section =
  RequestWithResponseType["request_form"]["form_section"][0];
export type Field = FormType["form_section"][0]["section_field"][0];

export type FieldWithResponseArray = Field & {
  field_response: RequestResponseTableRow[];
};
type Props = {
  request: RequestWithResponseType;
  itemOptions: OptionTableRow[];
  originalItemOptions: OptionTableRow[];
  sourceProjectList: Record<string, string>;
  requestingProject: string;
};

const EditReleaseOrderPage = ({
  request,
  itemOptions,
  sourceProjectList,
  requestingProject,
  originalItemOptions,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();

  const requestorProfile = useUserProfile();

  const [availableItems, setAvailableItems] =
    useState<OptionTableRow[]>(itemOptions);

  const { setIsLoading } = useLoadingActions();

  const { request_form: form } = request;
  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
  };

  const signerList: FormType["form_signer"] = request.request_signer
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

  const requestFormMethods = useForm<RequestFormValues>({
    defaultValues: { sections: form.form_section },
  });

  const {
    handleSubmit,
    setValue,
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
      setIsLoading(true);
      let isValid = true;
      for (const section of data.sections.slice(1)) {
        if (
          section.section_field[2].field_response[0].request_response ===
          "Invalid"
        ) {
          isValid = false;
          break;
        }
      }
      if (!isValid) {
        setIsLoading(false);
        notifications.show({
          message: "There are invalid quantities.",
          color: "orange",
        });
        return;
      }

      const sourcedItemId = JSON.stringify(
        data.sections[0].section_field[1].field_response[0].request_response
      );
      const itemSection = data.sections[1];
      const tempRequestId = uuidv4();

      const itemFieldList: RequestResponseTableRow[] = [];
      const quantityFieldList: RequestResponseTableRow[] = [];

      data.sections.slice(1).forEach((section) => {
        section.section_field.forEach((field) => {
          if (field.field_name === "Item") {
            itemFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(
                field.field_response[0].request_response
              ),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          } else if (field.field_name === "Quantity") {
            quantityFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(
                field.field_response[0].request_response
              ),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          }
        });
      });

      const warningItemList = await checkROItemQuantity(supabaseClient, {
        sourcedItemId,
        itemFieldId: itemSection.section_field[0].field_id,
        quantityFieldId: itemSection.section_field[1].field_id,
        itemFieldList,
        quantityFieldList,
      });

      if (warningItemList && warningItemList.length !== 0) {
        modals.open({
          title: "You cannot edit this request.",
          centered: true,
          children: (
            <Box maw={390}>
              <Title order={5}>
                There are items that will exceed the quantity limit of the
                Sourced Item
              </Title>
              <List size="sm" mt="md" spacing="xs">
                {warningItemList.map((item) => (
                  <List.Item key={item}>{item}</List.Item>
                ))}
              </List>
              <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                Close
              </Button>
            </Box>
          ),
        });
      } else {
        const isPending = await checkIfRequestIsPending(supabaseClient, {
          requestId: request.request_id,
        });

        if (!isPending) {
          notifications.show({
            message: "Request can't be edited",
            color: "red",
          });
          router.push(`/team-requests/requests/${request.request_id}`);
          return;
        }

        await editRequest(supabaseClient, {
          requestId: request.request_id,
          requestFormValues: data,
          signers: signerList,
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
        });

        notifications.show({
          message: "Request edited.",
          color: "green",
        });
        router.push(`/team-requests/requests/${request.request_id}`);
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    if (
      availableItems.length === 0 ||
      formSections.length === originalItemOptions.length + 1
    ) {
      notifications.show({
        message: "No available item.",
        color: "orange",
      });
      return;
    }

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
          field_response: field.field_response.map((response) => ({
            ...response,
            request_response: "",
          })),
          field_section_duplicatable_id: sectionDuplicatableId,
          field_option: availableItems.sort((a, b) => {
            return a.option_order - b.option_order;
          }),
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

  const handleRemoveSection = (sectionDuplicatableIndex: number) => {
    if (
      formSections[sectionDuplicatableIndex].section_field[0].field_response
    ) {
      const option = formSections[
        sectionDuplicatableIndex
      ].section_field[0].field_option.find(
        (fieldOption) =>
          fieldOption.option_value ===
          parseJSONIfValid(
            formSections[sectionDuplicatableIndex].section_field[0]
              .field_response[0].request_response
          )
      ) as OptionTableRow;
      if (option) {
        setAvailableItems((prev) => {
          return [...prev, option];
        });

        const sectionList = getValues(`sections`);
        const itemSectionList = sectionList.slice(1);

        itemSectionList.forEach((section, sectionIndex) => {
          sectionIndex += 1;
          if (sectionIndex !== sectionDuplicatableIndex) {
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

    removeSection(sectionDuplicatableIndex);
  };

  const handleItemChange = async (
    index: number,
    value: string | null,
    prevValue: string | null
  ) => {
    const sectionList = getValues(`sections`);
    const itemSectionList = sectionList.slice(1);

    if (value) {
      setAvailableItems((prev) =>
        prev.filter((item) => item.option_value !== value)
      );
      itemSectionList.forEach((section, sectionIndex) => {
        sectionIndex += 1;
        if (sectionIndex !== index) {
          updateSection(sectionIndex, {
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...section.section_field[0].field_option.filter(
                    (option) => option.option_value !== value
                  ),
                ],
              },
              ...section.section_field.slice(1),
            ],
          });
        } else {
          const status = checkQuantity(
            value,
            Number(section.section_field[1].field_response[0].request_response)
          );

          setValue(
            `sections.${index}.section_field.2.field_response.0.request_response`,
            `${status}`
          );
          setValue(
            `sections.${index}.section_field.3.field_response.0.request_response`,
            sourceProjectList[value]
          );
        }
      });
    } else {
      setValue(
        `sections.${index}.section_field.2.field_response.0.request_response`,
        " "
      );
      setValue(
        `sections.${index}.section_field.3.field_response.0.request_response`,
        " "
      );
    }

    const newOption = itemOptions.find(
      (option) => option.option_value === prevValue
    );
    if (newOption) {
      setAvailableItems((prev) => {
        return [...prev, newOption];
      });
      itemSectionList.forEach((section, sectionIndex) => {
        sectionIndex += 1;
        if (sectionIndex !== index) {
          updateSection(sectionIndex, {
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...section.section_field[0].field_option.filter(
                    (option) => option.option_value !== value
                  ),
                  newOption,
                ].sort((a, b) => {
                  return a.option_order - b.option_order;
                }),
              },
              ...section.section_field.slice(2),
            ],
          });
        }
      });
    }
  };

  const handleQuantityChange = async (index: number, value: number) => {
    const section = getValues(`sections.${index}`);
    const status = checkQuantity(
      `${section.section_field[0].field_response[0].request_response}`,
      value
    );
    if (!status) return;
    setValue(
      `sections.${index}.section_field.2.field_response.0.request_response`,
      `${status}`
    );
  };

  const checkQuantity = (item: string, quantity: number) => {
    if (isNaN(quantity)) return;

    const matches = regExp.exec(item);
    if (!matches) return;
    const quantityMatch = matches[1].match(/(\d+)/);
    if (!quantityMatch) return;

    const maximumQuantity = Number(quantityMatch[1]);

    if (maximumQuantity) {
      if (quantity <= 0 || quantity > maximumQuantity) {
        return "Invalid";
      } else if (quantity < maximumQuantity) {
        return "Partially Received";
      } else {
        return "Fully Received";
      }
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
            <RequestFormDetails
              formDetails={formDetails}
              requestingProject={requestingProject}
            />
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
                    formslyFormName="Quotation"
                    onRemoveSection={handleRemoveSection}
                    isSectionRemovable={isRemovable}
                    quotationFormMethods={{ onItemChange: handleItemChange }}
                    rirFormMethods={{ onQuantityChange: handleQuantityChange }}
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

export default EditReleaseOrderPage;
