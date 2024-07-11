import {
  getNonDuplictableSectionResponse,
  getProjectSignerWithTeamMember,
  getSectionInRequestPage,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import { calculateInvoiceAmountWithVAT, safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
  RequestTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
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
  projectOptions: OptionTableRow[];
  bankListOptions: OptionTableRow[];
  duplicatableSectionIdList: string[];
  requestId: string;
};

const EditLiquidReimbursementRequestPage = ({
  form,
  projectOptions,
  duplicatableSectionIdList,
  requestId,
  bankListOptions,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const isReferenceOnly = Boolean(router.query.referenceOnly);

  const [initialRequestDetails, setInitialRequestDetails] =
    useState<RequestFormValues>();
  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );

  const [isFetchingSigner, setIsFetchingSigner] = useState(false);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const initialFormSectionList = [
    {
      ...form.form_section[0],
      section_field: form.form_section[0].section_field.filter(
        (field) => field.field_name !== "BOQ Code"
      ),
    },
    ...form.form_section.slice(1),
  ];

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_type: form.form_type,
    form_sub_type: form.form_sub_type,
  };

  const requestFormMethods = useForm<RequestFormValues>({ mode: "onChange" });
  const { handleSubmit, control, setValue, unregister, getValues } =
    requestFormMethods;
  const {
    fields: formSections,
    insert: insertSection,
    remove: removeSection,
    replace: replaceSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const onSubmit = async (data: RequestFormValues) => {
    if (isFetchingSigner) {
      notifications.show({
        message: "Wait until all signers are fetched before submitting.",
        color: "orange",
      });
      return;
    }
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const response = data.sections[0].section_field[0]
        .field_response as string;

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const additionalSignerList: FormType["form_signer"] = [];

      let request: RequestTableRow;
      if (isReferenceOnly) {
        request = await createRequest(supabaseClient, {
          requestFormValues: data,
          formId: form.form_id,
          teamMemberId: teamMember.team_member_id,
          signers: [...signerList, ...additionalSignerList],
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
          isFormslyForm: true,
          projectId,
          teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
        });
      } else {
        request = await editRequest(supabaseClient, {
          requestId,
          requestFormValues: data,
          signers: [...signerList, ...additionalSignerList],
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
          teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
        });
      }

      notifications.show({
        message: `Request ${isReferenceOnly ? "created" : "edited"}.`,
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          request.request_formsly_id_prefix
        }-${request.request_formsly_id_serial}`
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
            formId: form.form_id,
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
      setValue(`sections.0.section_field.0.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handleResetRequest = () => {
    unregister(`sections.${0}`);
    replaceSection(initialRequestDetails ? initialRequestDetails.sections : []);
    handleProjectNameChange(
      initialRequestDetails?.sections[0].section_field[0]
        .field_response as string
    );
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = initialFormSectionList.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => ({
          ...field,
          field_section_duplicatable_id: sectionDuplicatableId,
        })
      );
      duplicatedFieldsWithDuplicatableId.splice(9, 1);
      const newSection = {
        ...sectionMatch,
        section_order: sectionLastIndex + 1,
        section_field: duplicatedFieldsWithDuplicatableId.filter(
          (field) =>
            ![
              "VAT",
              "Account Name",
              "Payment Option",
              "Account Number",
              "Specify Other Type of Request",
            ].includes(field.field_name)
        ),
      };

      insertSection(sectionLastIndex + 1, newSection, {
        focusIndex: sectionLastIndex + 1,
      });
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
    }
  };

  const handleRequestTypeChange = async (value: string | null) => {
    try {
      const currentRequestDetails = getValues(`sections.${0}`);
      const sectionFields = currentRequestDetails.section_field;
      const conditionalFieldExists = sectionFields.some(
        (field) => field.field_name === "Working Advances"
      );
      const valueIsLiquidationType = value
        ?.toLowerCase()
        .includes("liquidation");

      const addConditionalFields =
        valueIsLiquidationType && !conditionalFieldExists;
      const removeConditionalFields =
        !valueIsLiquidationType && conditionalFieldExists;

      if (addConditionalFields) {
        const liquidationAdditionalFields =
          initialFormSectionList[0].section_field.slice(5, 7);
        updateSection(0, {
          ...currentRequestDetails,
          section_field: [
            ...sectionFields,
            ...liquidationAdditionalFields,
          ].sort((a, b) => a.field_order - b.field_order),
        });
        return;
      }

      if (removeConditionalFields) {
        updateSection(0, {
          ...currentRequestDetails,
          section_field: sectionFields.filter(
            (field) =>
              !["Working Advances", "Ticket ID"].includes(field.field_name)
          ),
        });
        return;
      }
    } catch (e) {
      setValue(`sections.0.section_field.4.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleDepartmentChange = async (value: string | null) => {
    try {
      const currentRequestDetails = getValues(`sections.${0}`);
      const sectionFields = currentRequestDetails.section_field;
      const conditionalFieldExists = sectionFields.some(
        (field) => field.field_name === "Equipment Code"
      );
      const valueIsPED = value?.toLowerCase().includes("plants and equipment");

      const addConditionalFields = valueIsPED && !conditionalFieldExists;
      const removeConditionalFields = !valueIsPED && conditionalFieldExists;

      if (addConditionalFields) {
        const equipmentCodeField = initialFormSectionList[0].section_field[7];
        updateSection(0, {
          ...currentRequestDetails,
          section_field: [...sectionFields, equipmentCodeField],
        });
      } else if (removeConditionalFields) {
        const updatedSectionFields = sectionFields.filter(
          (field) => field.field_name !== "Equipment Code"
        );

        const requestDetailsSection = {
          ...currentRequestDetails,
          section_field: updatedSectionFields,
        };

        updateSection(0, requestDetailsSection);
      }
    } catch (e) {
      setValue(`sections.0.section_field.2.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleInvoiceAmountChange = (value: number, sectionIndex: number) => {
    try {
      const currentPayeeSection = getValues(`sections.${sectionIndex}`);
      const isWithVAT = Boolean(
        currentPayeeSection.section_field.find(
          (field) => field.field_name === "This payee have VAT?"
        )?.field_response
      );
      const conditionalVatFieldIndex =
        currentPayeeSection.section_field.findIndex(
          (field) => field.field_name === "VAT"
        );

      const vatFieldIndex = currentPayeeSection.section_field.findIndex(
        (field) => field.field_name === "VAT"
      );
      const costFieldIndex = currentPayeeSection.section_field.findIndex(
        (field) => field.field_name === "Cost"
      );

      if (isWithVAT) {
        const vatValue = calculateInvoiceAmountWithVAT(value);
        if (conditionalVatFieldIndex === -1) {
          updateSection(sectionIndex, {
            ...currentPayeeSection,
            section_field: [
              ...currentPayeeSection.section_field,
              initialFormSectionList[1].section_field[6],
            ],
          });
        }
        setValue(
          `sections.${sectionIndex}.section_field.${vatFieldIndex}.field_response`,
          vatValue
        );
        setValue(
          `sections.${sectionIndex}.section_field.${costFieldIndex}.field_response`,
          value - vatValue
        );
      } else {
        setValue(
          `sections.${sectionIndex}.section_field.${costFieldIndex}.field_response`,
          value
        );
      }
    } catch (error) {
      setValue(`sections.${sectionIndex}.section_field.4.field_response`, 0);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handlePayeeVatBooleanChange = (
    value: boolean,
    fieldIndex: number,
    sectionIndex: number
  ) => {
    try {
      const currentPayeeSection = getValues(`sections.${sectionIndex}`);
      const invoiceAmountField = currentPayeeSection.section_field.find(
        (field) => field.field_name === "Invoice Amount"
      );
      const invoiceAmount = Number(invoiceAmountField?.field_response);

      const vatFieldIndex = currentPayeeSection.section_field.findIndex(
        (field) => field.field_name === "VAT"
      );
      const costFieldIndex = currentPayeeSection.section_field.findIndex(
        (field) => field.field_name === "Cost"
      );

      const vatConditionalField = {
        ...initialFormSectionList[1].section_field[6],
        field_response: calculateInvoiceAmountWithVAT(invoiceAmount),
        field_section_duplicatable_id:
          invoiceAmountField?.field_section_duplicatable_id,
      };

      const updatedFields = [...currentPayeeSection.section_field];

      if (value) {
        // Add or update VAT field
        if (vatFieldIndex === -1) {
          updatedFields.push(vatConditionalField);
        } else {
          updatedFields[vatFieldIndex] = vatConditionalField;
        }
        setValue(
          `sections.${sectionIndex}.section_field.${costFieldIndex}.field_response`,
          invoiceAmount - vatConditionalField.field_response
        );
      } else {
        // Remove VAT field if it exists
        if (vatFieldIndex !== -1) {
          updatedFields.splice(vatFieldIndex, 1);
        }
        setValue(
          `sections.${sectionIndex}.section_field.${costFieldIndex}.field_response`,
          invoiceAmount
        );
      }

      updateSection(sectionIndex, {
        ...currentPayeeSection,
        section_field: updatedFields.sort(
          (a, b) => a.field_order - b.field_order
        ),
      });
    } catch (error) {
      setValue(
        `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`,
        false
      );
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleModeOfPaymentChange = (
    value: string | null,
    fieldIndex: number,
    sectionIndex: number
  ) => {
    try {
      if (!value) return;

      const selectedSection = getValues(`sections.${sectionIndex}`);
      const paymentOptionField = {
        ...initialFormSectionList[2].section_field[1],
        field_option: bankListOptions,
      };

      const isWithAccountConditionalField = [
        "Bank Transfer",
        "E-Cash",
        "Telegraphic Transfer",
      ].includes(value);
      const isBankTransfer = value === "Bank Transfer";

      let updatedFields = selectedSection.section_field.filter(
        (field) =>
          !["Payment Option", "Account Name", "Account Number"].includes(
            field.field_name
          )
      );

      const conditionalFieldList =
        initialFormSectionList[2].section_field.filter((field) =>
          ["Account Name", "Account Number"].includes(field.field_name)
        );

      if (isWithAccountConditionalField) {
        const additionalFields = isBankTransfer
          ? [paymentOptionField, ...conditionalFieldList]
          : conditionalFieldList;

        updatedFields = [...updatedFields, ...additionalFields];
      }

      removeSection(sectionIndex);
      insertSection(
        sectionIndex,
        {
          ...selectedSection,
          section_field: updatedFields,
        },
        { focusName: `sections.${sectionIndex}.section_field.1.field_response` }
      );
    } catch (error) {
      setValue(
        `sections.${sectionIndex}.section_field.${fieldIndex}.field_response`,
        ""
      );
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleTypeOfRequestChange = (
    value: string | null,
    sectionIndex: number
  ) => {
    try {
      const currentPayeeSection = getValues(`sections.${sectionIndex}`);
      const specifyOtherTypeOfRequestField =
        currentPayeeSection.section_field.find(
          (field) => field.field_name === "Specify Other Type of Request"
        );
      let currentPayeeSectionFieldList = currentPayeeSection.section_field;

      const addField = (fieldIndex: number) => {
        const selectedField =
          initialFormSectionList[1].section_field[fieldIndex];
        currentPayeeSectionFieldList = [
          ...currentPayeeSectionFieldList,
          selectedField,
        ];
      };

      const removeFieldById = (fieldId: string) => {
        currentPayeeSectionFieldList = currentPayeeSectionFieldList.filter(
          (field) => field.field_id !== fieldId
        );
      };

      if (value === "Other") {
        addField(3);
      } else if (specifyOtherTypeOfRequestField) {
        removeFieldById(specifyOtherTypeOfRequestField.field_id);
      }

      setValue(`sections.${sectionIndex}.section_field.3.field_response`, 0);
      updateSection(sectionIndex, {
        ...currentPayeeSection,
        section_field: currentPayeeSectionFieldList.sort(
          (a, b) => a.field_order - b.field_order
        ),
      });
    } catch (error) {
      setValue(`sections.${sectionIndex}.section_field.2.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (!team.team_id) return;
    try {
      const fetchRequestDetails = async () => {
        // Fetch response
        // Request Details Section
        const requestDetailsSectionResponse =
          await getNonDuplictableSectionResponse(supabaseClient, {
            requestId,
            fieldIdList: form.form_section[0].section_field.map(
              (field) => field.field_id
            ),
          });
        let requestDetailsSectionFieldList = form.form_section[0].section_field
          .map((field) => {
            const response = requestDetailsSectionResponse.find(
              (response) =>
                response.request_response_field_id === field.field_id
            );
            return {
              ...field,
              field_response: response
                ? safeParse(response.request_response)
                : "",
            };
          })
          .filter((field) => field.field_name !== "BOQ Code");

        const isPED = requestDetailsSectionFieldList.some(
          (field) =>
            field.field_name === "Department" &&
            field.field_response === "Plants and Equipment"
        );

        const requestTypeResponse = safeParse(
          `${
            requestDetailsSectionFieldList.find(
              (field) => field.field_name === "Request Type"
            )?.field_response
          }`
        );

        const isNotLiquidation = !requestTypeResponse
          .toLowerCase()
          .includes("liquidation");

        if (isNotLiquidation) {
          requestDetailsSectionFieldList =
            requestDetailsSectionFieldList.filter(
              (field) =>
                !["Working Advances", "Ticket ID"].includes(field.field_name)
            );
        }

        if (!isPED) {
          requestDetailsSectionFieldList =
            requestDetailsSectionFieldList.filter(
              (field) => !["Equipment Code"].includes(field.field_name)
            );
        }

        // Payee Section
        let index = 0;
        const newFields: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [];
        while (1) {
          setIsLoading(true);
          const duplicatableSectionIdCondition = duplicatableSectionIdList
            .slice(index, index + 5)
            .map((dupId) => `'${dupId}'`)
            .join(",");

          const data = await getSectionInRequestPage(supabaseClient, {
            index,
            requestId: requestId,
            sectionId: form.form_section[1].section_id,
            duplicatableSectionIdCondition:
              duplicatableSectionIdCondition.length !== 0
                ? duplicatableSectionIdCondition
                : `'${uuidv4()}'`,
            withOption: true,
          });
          newFields.push(...data);
          index += 5;

          if (index > duplicatableSectionIdList.length) break;
        }

        const uniqueFieldIdList: string[] = [];
        const combinedFieldList: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [];
        newFields.forEach((field) => {
          if (uniqueFieldIdList.includes(field.field_id)) {
            const currentFieldIndex = combinedFieldList.findIndex(
              (combinedField) => combinedField.field_id === field.field_id
            );
            combinedFieldList[currentFieldIndex].field_response.push(
              ...field.field_response
            );
          } else {
            uniqueFieldIdList.push(field.field_id);
            combinedFieldList.push(field);
          }
        });

        // Format section
        const newSection = generateSectionWithDuplicateList([
          {
            ...form.form_section[1],
            section_field: combinedFieldList,
          },
        ]);

        // Input option to the sections
        const formattedSection = newSection.map((section) => {
          const fieldList: Section["section_field"] = [];
          section.section_field.forEach((field) => {
            const response = field.field_response?.request_response
              ? safeParse(field.field_response?.request_response)
              : "";
            let option: OptionTableRow[] = field.field_option ?? [];

            if (field.field_name === "Payment Option") {
              option = bankListOptions;
            }

            if (response) {
              fieldList.push({
                ...field,
                field_response: response,
                field_option: option,
              });
            }
          });

          return {
            ...section,
            section_field: fieldList,
          };
        });

        // Filter section with unique item name
        const uniqueItemName: string[] = [];
        const filteredSection: RequestFormValues["sections"] = [];
        formattedSection.forEach((section) => {
          if (
            !uniqueItemName.includes(
              `${section.section_field[0].field_response}`
            )
          ) {
            uniqueItemName.push(`${section.section_field[0].field_response}`);
            filteredSection.push(section);
          }
        });

        // Add duplicatable section id
        const sectionWithDuplicatableId = formattedSection.map(
          (section, index) => {
            const dupId = index ? uuidv4() : undefined;
            return {
              ...section,
              section_field: section.section_field.map((field) => {
                return {
                  ...field,
                  field_section_duplicatable_id: dupId,
                };
              }),
            };
          }
        );

        const paymentSectionResponse = await getNonDuplictableSectionResponse(
          supabaseClient,
          {
            requestId,
            fieldIdList: form.form_section[2].section_field.map(
              (field) => field.field_id
            ),
          }
        );

        let paymentSectionFieldList = form.form_section[2].section_field.map(
          (field) => {
            const response = paymentSectionResponse.find(
              (response) =>
                response.request_response_field_id === field.field_id
            );

            let fieldOption: OptionTableRow[] = field.field_option;
            if (field.field_name === "Payment Option") {
              fieldOption = bankListOptions;
            }

            return {
              ...field,
              field_response: response
                ? safeParse(response.request_response)
                : "",
              field_option: fieldOption,
            };
          }
        );

        const modeOfPaymentResponse = paymentSectionFieldList[0].field_response;
        const isWithAccountConditionalField = [
          "Bank Transfer",
          "E-Cash",
          "Telegraphic Transfer",
        ].includes(modeOfPaymentResponse);
        const isBankTransfer = modeOfPaymentResponse === "Bank Transfer";

        if (isWithAccountConditionalField) {
          if (!isBankTransfer) {
            paymentSectionFieldList = paymentSectionFieldList.filter(
              (field) => field.field_name !== "Payment Option"
            );
          }
        } else {
          paymentSectionFieldList = [paymentSectionFieldList[0]];
        }

        // fetch additional signer
        handleProjectNameChange(
          requestDetailsSectionFieldList[0].field_response
        );

        const finalInitialRequestDetails = [
          {
            ...form.form_section[0],
            section_field: requestDetailsSectionFieldList,
          },
          ...sectionWithDuplicatableId,
          { ...form.form_section[2], section_field: paymentSectionFieldList },
        ];

        replaceSection(finalInitialRequestDetails);
        setInitialRequestDetails({ sections: finalInitialRequestDetails });
        setIsLoading(false);
      };
      fetchRequestDetails();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }, [team]);

  return (
    <Container>
      <Title order={2} color="dimmed">
        {isReferenceOnly ? "Create" : "Edit"} Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    liquidationReimbursementFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onRequestTypeChange: handleRequestTypeChange,
                      onDepartmentChange: handleDepartmentChange,
                      onTypeOfRequestChange: handleTypeOfRequestChange,
                      onPayeeVatBooleanChange: handlePayeeVatBooleanChange,
                      onInvoiceAmountChange: handleInvoiceAmountChange,
                      onModeOfPaymentChange: handleModeOfPaymentChange,
                    }}
                    formslyFormName={form.form_name}
                    isEdit={!isReferenceOnly}
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
              <Button
                variant="outline"
                color="red"
                onClick={handleResetRequest}
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

export default EditLiquidReimbursementRequestPage;
