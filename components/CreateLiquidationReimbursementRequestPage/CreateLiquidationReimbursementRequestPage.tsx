import { getProjectSignerWithTeamMember } from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { calculateInvoiceAmountWithVAT } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
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
};

const CreateLiquidationReimbursementRequestPage = ({
  form,
  projectOptions,
  bankListOptions,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const activeTeam = useActiveTeam();

  const requestorProfile = useUserProfile();

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>({
    mode: "onChange",
  });
  const { handleSubmit, control, setValue, getValues } = requestFormMethods;
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

  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );

  const handleCreateRequest = async (data: RequestFormValues) => {
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
        teamName: formatTeamNameToUrlKey(activeTeam.team_name ?? ""),
      });

      notifications.show({
        message: "Request created.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/requests/${
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
      setValue(`sections.0.section_field.0.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
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
          form.form_section[0].section_field.slice(5, 7);
        updateSection(0, {
          ...currentRequestDetails,
          section_field: [...sectionFields, ...liquidationAdditionalFields],
        });
        return;
      }

      if (removeConditionalFields) {
        updateSection(0, {
          ...currentRequestDetails,
          section_field: sectionFields.slice(0, 5),
        });
        return;
      }
    } catch (e) {
      setValue(`sections.0.section_field.5.field_response`, "");
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
        (field) => field.field_name === "Cost Code"
      );
      const valueIsPED = value?.toLowerCase().includes("plants and equipment");

      const addConditionalFields = valueIsPED && !conditionalFieldExists;
      const removeConditionalFields = !valueIsPED && conditionalFieldExists;

      if (addConditionalFields) {
        const pedConditionalFields = form.form_section[0].section_field.slice(
          7,
          9
        );
        updateSection(0, {
          ...currentRequestDetails,
          section_field: [...sectionFields, ...pedConditionalFields],
        });
        return;
      }

      if (removeConditionalFields) {
        const updatedSectionFields = sectionFields.filter(
          (field) => !["Cost Code", "BOQ Code"].includes(field.field_name)
        );

        const requestDetailsSection = {
          ...currentRequestDetails,
          section_field: updatedSectionFields,
        };

        const payeeSection = getValues(`sections`).slice(1);
        replaceSection([requestDetailsSection, ...payeeSection]);
        return;
      }
    } catch (e) {
      setValue(`sections.0.section_field.2.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
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

      insertSection(sectionLastIndex + 1, newSection);
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
              form.form_section[1].section_field[6],
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
        ...form.form_section[1].section_field[6],
        field_response: calculateInvoiceAmountWithVAT(invoiceAmount),
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
        ...form.form_section[1].section_field[9],
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

      const conditionalFieldList = form.form_section[1].section_field.filter(
        (field) => ["Account Name", "Account Number"].includes(field.field_name)
      );

      if (isWithAccountConditionalField) {
        const additionalFields = isBankTransfer
          ? [paymentOptionField, ...conditionalFieldList]
          : conditionalFieldList;

        updatedFields = [...updatedFields, ...additionalFields];
      }
      removeSection(sectionIndex);
      insertSection(sectionIndex, {
        ...selectedSection,
        section_field: updatedFields,
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
        const selectedField = form.form_section[1].section_field[fieldIndex];
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
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        if (!activeTeam.team_id) return;

        // remove conditional fields [working advances, ticket id]
        const requestDetailsSection = {
          ...form.form_section[0],
          section_field: form.form_section[0].section_field.slice(0, 5),
        };
        const payeeSection = {
          ...form.form_section[1],
          section_field: form.form_section[1].section_field.filter(
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

        replaceSection([requestDetailsSection, payeeSection]);
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, [activeTeam]);

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

export default CreateLiquidationReimbursementRequestPage;
