import {
  getEmployeeName,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
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
  departmentOptions: OptionTableRow[];
  bankListOptions: OptionTableRow[];
  uomOptions: OptionTableRow[];
  equipmentCodeOptions: OptionTableRow[];
};

const CreatePettyCashVoucherRequestPage = ({
  form,
  projectOptions,
  departmentOptions,
  bankListOptions,
  uomOptions,
  equipmentCodeOptions,
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

  const requestFormMethods = useForm<RequestFormValues>({ mode: "onChange" });
  const { handleSubmit, control, setValue, getValues, setFocus } =
    requestFormMethods;
  const {
    fields: formSections,
    replace: replaceSection,
    update: updateSection,
    insert: insertSection,
    remove: removeSection,
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
  const [loadingFieldList, setLoadingFieldList] = useState<
    { sectionIndex: number; fieldIndex: number }[]
  >([]);

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

      const response = data.sections[1].section_field[0]
        .field_response as string;

      const projectId = data.sections[1].section_field[0].field_option.find(
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

      await router.push(
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

  const handleProjectOrDepartmentNameChange = async () => {
    try {
      setIsFetchingSigner(true);
      const selectedProject = getValues(
        `sections.1.section_field.0.field_response`
      );
      const selectedDepartment = getValues(
        `sections.1.section_field.2.field_response`
      );

      const projectId = projectOptions.find(
        (option) => option.option_value === selectedProject
      )?.option_id;
      const departmentId = departmentOptions.find(
        (option) => option.option_value === selectedDepartment
      )?.option_id;

      if (projectId) {
        const data = await getProjectSignerWithTeamMember(supabaseClient, {
          projectId,
          formId: form.form_id,
          departmentId: departmentId ?? undefined,
        });
        if (data.length !== 0) {
          setSignerList(data as unknown as FormType["form_signer"]);
        } else {
          resetSigner();
        }
      }

      const isPed = selectedDepartment === "Plants and Equipment";
      const requestDetailsSection = getValues(`sections.1`);
      const pedConditionalField = form.form_section[1].section_field[10];
      const pedConditionalFieldIndex =
        requestDetailsSection.section_field.findIndex(
          (field) =>
            field.field_name === "Is this request charged to the project?"
        );
      const chargeToProjectSectionIndex = getValues(`sections`).findIndex(
        (section) => section.section_name === "Charge to Project Details"
      );

      if (selectedProject) {
        if (isPed && pedConditionalFieldIndex < 0) {
          updateSection(1, {
            ...requestDetailsSection,
            section_field: [
              ...requestDetailsSection.section_field,
              pedConditionalField,
            ],
          });
        } else if (!isPed && pedConditionalFieldIndex > 0) {
          updateSection(1, {
            ...requestDetailsSection,
            section_field: requestDetailsSection.section_field.filter(
              (field) => field.field_order !== 11
            ),
          });
          if (
            chargeToProjectSectionIndex === 2 &&
            getValues(`sections.2`).section_name === "Charge to Project Details"
          ) {
            removeSection(chargeToProjectSectionIndex);
          }
        }
      }
    } catch (e) {
      setValue(`sections.1.section_field.0.field_response`, "");
      setValue(`sections.1.section_field.2.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handlePettyCashVoucherBooleanChange = (
    value: boolean,
    sectionIndex: number
  ) => {
    try {
      const selectedSection = getValues(`sections.${sectionIndex}`);
      const pedConditionalFieldExists = selectedSection.section_field.find(
        (field) =>
          field.field_name === "Is this request charged to the project?"
      );

      if (value) {
        let selectedSectionFieldList = [
          ...selectedSection.section_field.slice(0, 9),
          form.form_section[sectionIndex].section_field[9],
        ];

        if (pedConditionalFieldExists) {
          selectedSectionFieldList = [
            ...selectedSectionFieldList,
            pedConditionalFieldExists,
          ];
        }
        updateSection(sectionIndex, {
          ...selectedSection,
          section_field: selectedSectionFieldList,
        });
        setTimeout(
          () =>
            setFocus(`sections.${sectionIndex}.section_field.9.field_response`),
          0
        );
      } else {
        updateSection(sectionIndex, {
          ...selectedSection,
          section_field: selectedSection.section_field.filter(
            (field) => field.field_name !== "Approved Official Business"
          ),
        });
      }
    } catch (error) {
      setValue(
        `sections.${sectionIndex}.section_field.8.field_response`,
        false
      );

      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleEmployeeNumberChange = async (
    value: string | null,
    sectionIndex: number
  ) => {
    try {
      if (value) {
        setLoadingFieldList([{ sectionIndex, fieldIndex: 1 }]);

        const employee = await getEmployeeName(supabaseClient, {
          employeeId: value,
        });

        if (employee) {
          setValue(
            `sections.${sectionIndex}.section_field.4.field_response`,
            `${employee.scic_employee_first_name} ${
              employee.scic_employee_middle_name
            } ${employee.scic_employee_last_name} ${
              employee.scic_employee_suffix ?? ""
            }`
          );
        } else {
          setValue(
            `sections.${sectionIndex}.section_field.3.field_response`,
            ""
          );
          setValue(
            `sections.${sectionIndex}.section_field.4.field_response`,
            ""
          );
          notifications.show({
            message: `There's no employee with HRIS ${value}`,
            color: "orange",
          });
          return;
        }
      } else {
        setValue(`sections.${sectionIndex}.section_field.3.field_response`, "");
        setValue(`sections.${sectionIndex}.section_field.4.field_response`, "");
      }
    } catch (e) {
      setValue(`sections.${sectionIndex}.section_field.3.field_response`, "");
      setValue(`sections.${sectionIndex}.section_field.4.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setLoadingFieldList([]);
    }
  };

  const handleAccountingAuthorizationBooleanChange = (value: boolean) => {
    try {
      if (value) {
        const accountingAuthorizationSection = getValues(`sections.0`);
        const requestDetailsSection = form.form_section[1];
        const requestDetailsSectionWithProjectOptions = {
          ...requestDetailsSection,
          section_field: [
            {
              ...requestDetailsSection.section_field[0],
              field_option: projectOptions,
            },
            requestDetailsSection.section_field[1],
            {
              ...requestDetailsSection.section_field[2],
              field_option: departmentOptions,
            },
            ...requestDetailsSection.section_field.slice(3, 9),
          ],
        };
        const paymentSection = {
          ...form.form_section[3],
          section_field: [form.form_section[3].section_field[0]],
        };
        const scicAuthorizationSection = form.form_section[4];

        replaceSection([
          accountingAuthorizationSection,
          requestDetailsSectionWithProjectOptions,
          paymentSection,
          scicAuthorizationSection,
        ]);
      } else if (!value) {
        replaceSection([getValues(`sections.0`)]);
      }
    } catch (error) {
      setValue(`sections.0.section_field.0.field_response`, false);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleTypeOfRequestChange = (value: string | null) => {
    try {
      const chargeToProjectSection = getValues(`sections.2`);
      let chargeToProjectSectionFieldList =
        chargeToProjectSection.section_field;

      const addField = (fieldIndex: number) => {
        const selectedField = form.form_section[2].section_field[fieldIndex];
        if (selectedField.field_name === "Equipment Code") {
          selectedField.field_option = equipmentCodeOptions;
        }
        chargeToProjectSectionFieldList = [
          ...chargeToProjectSectionFieldList,
          selectedField,
        ];
      };

      const removeFieldById = (fieldId: string) => {
        chargeToProjectSectionFieldList =
          chargeToProjectSectionFieldList.filter(
            (field) => field.field_id !== fieldId
          );
      };

      if (value) {
        const specifyOtherTypeOfRequestField =
          chargeToProjectSectionFieldList.find(
            (field) => field.field_name === "Specify Other Type of Request"
          );
        const equipmentCodeField = chargeToProjectSectionFieldList.find(
          (field) => field.field_name === "Equipment Code"
        );

        switch (value) {
          case "Other":
            addField(3);
            if (equipmentCodeField)
              removeFieldById(equipmentCodeField.field_id);
            break;
          case "Spare Part":
            addField(4);
            if (specifyOtherTypeOfRequestField)
              removeFieldById(specifyOtherTypeOfRequestField.field_id);
            break;

          default:
            chargeToProjectSectionFieldList =
              chargeToProjectSection.section_field.slice(0, 3);
            break;
        }
      } else {
        chargeToProjectSectionFieldList =
          chargeToProjectSection.section_field.slice(0, 3);
      }
      removeSection(2);
      insertSection(2, {
        ...chargeToProjectSection,
        section_field: chargeToProjectSectionFieldList.sort(
          (a, b) => a.field_order - b.field_order
        ),
      });
    } catch (error) {
      setValue(`sections.2.section_field.1.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleChargeToProjectBooleanChange = (value: boolean) => {
    try {
      if (value) {
        const chargeToProjectSection = form.form_section[2];
        const sectionWithProjectOptions = {
          ...chargeToProjectSection,
          section_field: [
            {
              ...chargeToProjectSection.section_field[0],
              field_option: projectOptions,
            },
            ...chargeToProjectSection.section_field.slice(1, 3),
          ],
        };

        insertSection(2, sectionWithProjectOptions, { focusIndex: 0 });
      } else if (!value) {
        const requestDetailsSectionExists = getValues(`sections.2`);
        if (requestDetailsSectionExists) {
          removeSection(2);
        }
      }
    } catch (error) {
      const requestDetailsSection = getValues(`sections.1`);
      const pedConditionalFieldIndex =
        requestDetailsSection.section_field.findIndex(
          (field) =>
            field.field_name === "Is this request charged to the project?"
        );
      setValue(
        `sections.1.section_field.${pedConditionalFieldIndex}.field_response`,
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
    sectionIndex: number
  ) => {
    try {
      if (!value) return;

      const selectedSection = getValues(`sections.${sectionIndex}`);
      let currentSectionField = selectedSection.section_field;

      const isBankTransfer = value === "Bank Transfer";
      const paymentOptionField = {
        ...form.form_section[3].section_field[1],
        field_option: bankListOptions,
      };

      const conditionalFields = form.form_section[3].section_field.filter(
        (field) => ["Account Name", "Account Number"].includes(field.field_name)
      );

      const fieldExists = (fieldName: string) =>
        currentSectionField.some((field) => field.field_name === fieldName);

      const addFields = (fields: Field[]) =>
        (currentSectionField = [...currentSectionField, ...fields]);

      const removeField = (fieldName: string) =>
        (currentSectionField = currentSectionField.filter(
          (field) => field.field_name !== fieldName
        ));

      if (isBankTransfer) {
        if (fieldExists("Account Name")) {
          addFields([paymentOptionField]);
        } else {
          addFields([paymentOptionField, ...conditionalFields]);
        }
      } else {
        if (!fieldExists("Account Name")) {
          addFields(conditionalFields);
        } else if (fieldExists("Payment Option")) {
          removeField("Payment Option");
        }
      }

      currentSectionField.sort((a, b) => a.field_order - b.field_order);

      removeSection(sectionIndex);
      insertSection(
        sectionIndex,
        { ...selectedSection, section_field: currentSectionField },
        { shouldFocus: false }
      );
    } catch (error) {
      setValue(`sections.3.section_field.0.field_response`, false);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleSCICAuthorizationBooleanChange = (value: boolean) => {
    try {
      const currentRequestSectionList = getValues(`sections`);

      if (value) {
        const particularSection = form.form_section[5];
        const sectionWithProjectOptions = {
          ...particularSection,
          section_field: [
            ...particularSection.section_field.slice(0, 2),
            {
              ...particularSection.section_field[2],
              field_option: uomOptions,
            },
            ...particularSection.section_field.slice(3, 5),
          ],
        };

        insertSection(
          currentRequestSectionList.length,
          sectionWithProjectOptions,
          { focusIndex: 0 }
        );
      } else if (!value) {
        const particularSectionExists = getValues(
          `sections.${currentRequestSectionList.length - 1}`
        );
        if (particularSectionExists) {
          removeSection(currentRequestSectionList.length - 1);
        }
      }
    } catch (error) {
      const requestDetailsSection = getValues(`sections.1`);
      const pedConditionalFieldIndex =
        requestDetailsSection.section_field.findIndex(
          (field) =>
            field.field_name === "Is this request charged to the project?"
        );
      setValue(
        `sections.1.section_field.${pedConditionalFieldIndex}.field_response`,
        false
      );
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleQuantityOrUnitCostChange = (sectionIndex: number) => {
    try {
      const currentSectionFieldList = getValues(
        `sections.${sectionIndex}`
      ).section_field;

      const quantityField =
        (currentSectionFieldList[1].field_response as number) ?? 0;
      const unitCostField =
        (currentSectionFieldList[3].field_response as number) ?? 0;

      const amount = quantityField * unitCostField;

      setValue(
        `sections.${sectionIndex}.section_field.4.field_response`,
        amount
      );
    } catch (error) {
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
        replaceSection([form.form_section[0]]);
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
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    pettyCashVoucherFormMethods={{
                      onProjectOrDepartmentNameChange:
                        handleProjectOrDepartmentNameChange,
                      onPettyCashVoucherBooleanChange:
                        handlePettyCashVoucherBooleanChange,
                      onEmployeeNumberChange: handleEmployeeNumberChange,
                      onAccountingAuthorizationBooleanChange:
                        handleAccountingAuthorizationBooleanChange,
                      onChargeToProjectBooleanChange:
                        handleChargeToProjectBooleanChange,
                      onModeOfPaymentChange: handleModeOfPaymentChange,
                      onSCICAuthorizationChange:
                        handleSCICAuthorizationBooleanChange,
                      onTypeOfRequestChange: handleTypeOfRequestChange,
                      onQuantityOrUnitCostChange:
                        handleQuantityOrUnitCostChange,
                    }}
                    formslyFormName={form.form_name}
                    loadingFieldList={loadingFieldList}
                  />
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

export default CreatePettyCashVoucherRequestPage;
