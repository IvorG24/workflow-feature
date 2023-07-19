import { checkRIRPurchasedItemQuantity } from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { regExp } from "@/utils/string";
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
  List,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
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
  itemOptions: OptionTableRow[];
};

const CreateReceivingInspectingReportPurchasedPage = ({
  form,
  itemOptions,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();

  const requestorProfile = useUserProfile();

  const [availableItems, setAvailableItems] =
    useState<OptionTableRow[]>(itemOptions);

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
  const { handleSubmit, setValue, control, getValues } = requestFormMethods;
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
    replaceSection(form.form_section);
    const newFields = form.form_section[2].section_field.map((field) => {
      return {
        ...field,
        field_option: itemOptions,
      };
    });
    replaceSection([
      ...form.form_section.slice(0, 2),
      {
        ...form.form_section[2],
        section_field: newFields,
      },
    ]);
    setValue(
      `sections.${0}.section_field.${0}.field_response`,
      router.query.otpId
    );
    setValue(
      `sections.${0}.section_field.${1}.field_response`,
      router.query.quotationId
    );
  }, [form, replaceSection, requestFormMethods, itemOptions]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;
      setIsLoading(true);
      let isValid = true;
      for (const section of data.sections.slice(2)) {
        if (section.section_field[2].field_response === "Invalid") {
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

      if (
        !data.sections[1].section_field[0].field_response &&
        !data.sections[1].section_field[1].field_response
      ) {
        setIsLoading(false);
        notifications.show({
          message: "There must be a DR or SI for Quality Check",
          color: "orange",
        });
        return;
      }

      const quotationId = JSON.stringify(
        data.sections[0].section_field[1].field_response
      );
      const itemSection = data.sections[2];
      const tempRequestId = uuidv4();

      const itemFieldList: RequestResponseTableRow[] = [];
      const quantityFieldList: RequestResponseTableRow[] = [];

      data.sections.slice(2).forEach((section) => {
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

      const warningItemList = await checkRIRPurchasedItemQuantity(
        supabaseClient,
        {
          quotationId,
          itemFieldId: itemSection.section_field[0].field_id,
          quantityFieldId: itemSection.section_field[1].field_id,
          itemFieldList,
          quantityFieldList,
        }
      );

      if (warningItemList && warningItemList.length !== 0) {
        modals.open({
          title: "You cannot create this request.",
          centered: true,
          children: (
            <Box maw={390}>
              <Title order={5}>
                There are items that will exceed the quantity limit of the
                Quotation
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
        const request = await createRequest(supabaseClient, {
          requestFormValues: data,
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
      }
    } catch (e) {
      console.error(e);
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
      formSections.length === itemOptions.length + 2
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

  const handleRemoveSection = (sectionDuplicatableId: string) => {
    const sectionMatchIndex = formSections.findIndex(
      (section) =>
        section.section_field[0].field_section_duplicatable_id ===
        sectionDuplicatableId
    );

    if (sectionMatchIndex) {
      if (formSections[sectionMatchIndex].section_field[0].field_response) {
        const option = formSections[
          sectionMatchIndex
        ].section_field[0].field_option.find(
          (fieldOption) =>
            fieldOption.option_value ===
            formSections[sectionMatchIndex].section_field[0].field_response
        ) as OptionTableRow;

        if (option) {
          setAvailableItems((prev) => {
            return [...prev, option];
          });

          const sectionList = getValues(`sections`);
          const itemSectionList = sectionList.slice(1);

          itemSectionList.forEach((section, sectionIndex) => {
            sectionIndex += 1;
            if (sectionIndex !== sectionMatchIndex) {
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

      removeSection(sectionMatchIndex);
      return;
    }
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
            Number(section.section_field[1].field_response)
          );
          setValue(`sections.${index}.section_field.2.field_response`, status);
        }
      });
    } else {
      setValue(`sections.${index}.section_field.2.field_response`, undefined);
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
              ...section.section_field.slice(1),
            ],
          });
        }
      });
    }
  };

  const handleQuantityChange = async (index: number, value: number) => {
    const section = getValues(`sections.${index}`);
    const status = checkQuantity(
      `${section.section_field[0].field_response}`,
      value
    );
    setValue(`sections.${index}.section_field.2.field_response`, status);
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
                    formslyFormName="Quotation"
                    onRemoveSection={handleRemoveSection}
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
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateReceivingInspectingReportPurchasedPage;
