import {
  checkIfRequestIsEditable,
  checkRequisitionQuantity,
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
  requestingProject: string;
};

const EditQuotationRequestPage = ({
  request,
  itemOptions,
  originalItemOptions,
  requestingProject,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const activeTeam = useActiveTeam();

  const requestorProfile = useUserProfile();

  const { setIsLoading } = useLoadingActions();

  const [availableItems, setAvailableItems] =
    useState<OptionTableRow[]>(itemOptions);
  const [isSearching, setIsSearching] = useState(false);
  const [supplierOption, setSupplierOption] = useState<OptionTableRow[]>(
    request.request_form.form_section[1].section_field[0].field_option
  );

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
      setIsLoading(true);

      const requisitionID = JSON.stringify(
        formSections[0].section_field[0].field_response
      );
      const tempRequestId = uuidv4();

      const itemFieldList: RequestResponseTableRow[] = [];
      const quantityFieldList: RequestResponseTableRow[] = [];

      const itemSection = formSections.slice(3);

      itemSection.forEach((section) => {
        section.section_field.forEach((field) => {
          if (field.field_name === "Item") {
            itemFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(field.field_response),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          } else if (field.field_name === "Quantity") {
            quantityFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(field.field_response),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          }
        });
      });

      const warningItemList = await checkRequisitionQuantity(supabaseClient, {
        requisitionID,
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
                Requisition
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
        const isPending = await checkIfRequestIsEditable(supabaseClient, {
          requestId: request.request_id,
        });

        if (!isPending) {
          notifications.show({
            message: "Request can't be edited",
            color: "red",
          });
          router.push(
            `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/requests/${
              request.request_id
            }`
          );
          return;
        }

        await editRequest(supabaseClient, {
          requestId: request.request_id,
          requestFormValues: data,
          signers: signerList,
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
          teamName: formatTeamNameToUrlKey(activeTeam.team_name ?? ""),
        });

        notifications.show({
          message: "Request edited.",
          color: "green",
        });
        router.push(
          `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/requests/${
            request.request_id
          }`
        );
      }
    } catch {
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
      formSections.length === originalItemOptions.length + 3
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
            request_response_duplicatable_section_id: sectionDuplicatableId,
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
        const itemSectionList = sectionList.slice(3);

        itemSectionList.forEach((section, sectionIndex) => {
          sectionIndex += 3;
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

      removeSection(sectionDuplicatableIndex);
      return;
    }
  };

  const handleItemChange = async (
    index: number,
    value: string | null,
    prevValue: string | null
  ) => {
    const sectionList = getValues(`sections`);
    const itemSectionList = sectionList.slice(3);

    if (value) {
      setAvailableItems((prev) =>
        prev.filter((item) => item.option_value !== value)
      );
      itemSectionList.forEach((section, sectionIndex) => {
        sectionIndex += 3;
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
        }
      });
    }

    const newOption = itemOptions.find(
      (option) => option.option_value === prevValue
    );
    if (newOption) {
      setAvailableItems((prev) => {
        return [...prev, newOption];
      });
      itemSectionList.forEach((section, sectionIndex) => {
        sectionIndex += 3;
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
              ...section.section_field.slice(1),
            ],
          });
        }
      });
    }
  };

  const supplierSearch = async (value: string) => {
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
      setSupplierOption(supplierList);
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
                    quotationFormMethods={{
                      onItemChange: handleItemChange,
                      supplierSearch,
                      supplierOption,
                      isSearching,
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

export default EditQuotationRequestPage;
