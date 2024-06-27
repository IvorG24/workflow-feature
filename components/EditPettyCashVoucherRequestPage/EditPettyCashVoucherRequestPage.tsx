import {
  getEmployeeName,
  getNonDuplictableSectionResponse,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
  RequestTableRow,
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
  duplicatableSectionIdList: string[];
  requestId: string;
  departmentOptions: OptionTableRow[];
  expenseTypeOptions: OptionTableRow[];
  bankListOptions: OptionTableRow[];
  uomOptions: OptionTableRow[];
};

const EditPettyCashVoucherRequestPage = ({
  form,
  projectOptions,
  requestId,
  departmentOptions,
  expenseTypeOptions,
  bankListOptions,
  uomOptions,
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
  const [loadingFieldList, setLoadingFieldList] = useState<
    { sectionIndex: number; fieldIndex: number }[]
  >([]);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_type: form.form_type,
    form_sub_type: form.form_sub_type,
  };

  const requestFormMethods = useForm<RequestFormValues>({ mode: "onChange" });
  const { handleSubmit, control, setValue, unregister, getValues, setFocus } =
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

      const response = data.sections[1].section_field[0]
        .field_response as string;

      const projectId = data.sections[1].section_field[0].field_option.find(
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
      const pedConditionalFieldExists =
        requestDetailsSection.section_field.findIndex(
          (field) =>
            field.field_name === "Is this request charged to the project?"
        );
      const chargeToProjectSectionIndex = getValues(`sections`).findIndex(
        (section) => section.section_name === "Charge to Project Details"
      );

      if (isPed && !pedConditionalFieldExists) {
        updateSection(1, {
          ...requestDetailsSection,
          section_field: [
            ...requestDetailsSection.section_field,
            pedConditionalField,
          ],
        });
      } else if (!isPed && pedConditionalFieldExists) {
        updateSection(1, {
          ...requestDetailsSection,
          section_field: requestDetailsSection.section_field.filter(
            (field) => field.field_order !== 11
          ),
        });
        if (chargeToProjectSectionIndex) {
          removeSection(chargeToProjectSectionIndex);
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

  const handleResetRequest = () => {
    unregister(`sections.${0}`);
    replaceSection(initialRequestDetails ? initialRequestDetails.sections : []);
    if (initialRequestDetails) {
      handleUpdateConditionalSectionAndField(initialRequestDetails.sections);
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
        const requestDetailsSection = form.form_section[1];
        const sectionWithProjectOptions = {
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

        insertSection(1, sectionWithProjectOptions, { focusIndex: 0 });
      } else if (!value) {
        const requestDetailsSectionExists = getValues(`sections.1`);
        if (requestDetailsSectionExists) {
          removeSection(1);
        }
      }
    } catch (error) {
      setValue(`sections.0.section_field.0.field_response`, false);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleChargeToProjectBooleanChange = (value: boolean) => {
    try {
      const chargeToProjectSectionExists =
        getValues(`sections`).findIndex(
          (section) => section.section_name === "Charge to Project Details"
        ) > 0;
      if (value && !chargeToProjectSectionExists) {
        const chargeToProjectSection = form.form_section[2];
        const sectionWithProjectOptions = {
          ...chargeToProjectSection,
          section_field: [
            {
              ...chargeToProjectSection.section_field[0],
              field_option: projectOptions,
            },
            {
              ...chargeToProjectSection.section_field[1],
              field_option: expenseTypeOptions,
            },
            chargeToProjectSection.section_field[2],
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
      const paymentOptionField = {
        ...form.form_section[3].section_field[1],
        field_option: bankListOptions,
      };

      const isWithAccountConditionalField = [
        "Bank Transfer",
        "E-Cash",
        "Telegraphic Transfer",
      ].includes(value);

      const isBankTransfer = value === "Bank Transfer";
      const paymentOptionFieldExists = selectedSection.section_field.find(
        (field) => field.field_name === "Payment Option"
      );
      const conditionalFieldExists = selectedSection.section_field.find(
        (field) => field.field_name === "Account Name"
      );

      if (isWithAccountConditionalField) {
        if (isBankTransfer) {
          updateSection(sectionIndex, {
            ...selectedSection,
            section_field: [
              selectedSection.section_field[0],
              paymentOptionField,
              ...form.form_section[3].section_field.slice(2, 4),
            ],
          });
        } else if (!isBankTransfer && paymentOptionFieldExists) {
          updateSection(sectionIndex, {
            ...selectedSection,
            section_field: selectedSection.section_field.filter(
              (field) => field.field_name !== "Payment Option"
            ),
          });
        } else {
          updateSection(sectionIndex, {
            ...selectedSection,
            section_field: [
              selectedSection.section_field[0],
              ...form.form_section[3].section_field.slice(2, 4),
            ],
          });
        }
      } else if (!isWithAccountConditionalField && conditionalFieldExists) {
        updateSection(sectionIndex, {
          ...selectedSection,
          section_field: [selectedSection.section_field[0]],
        });
      }
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

  const handleUpdateConditionalSectionAndField = (sections: Section[]) => {
    handleProjectOrDepartmentNameChange();
    // update conditional sections and fields
    const isChargedToProject = sections[1].section_field.find(
      (field) => field.field_name === "Is this request charged to the project?"
    )?.field_response;

    handleChargeToProjectBooleanChange(isChargedToProject as boolean);

    const paymentDetailsSectionIndex = sections.findIndex(
      (section) => section.section_name === "Payment Details"
    );
    const modeOfPayment =
      sections[paymentDetailsSectionIndex].section_field[0].field_response;

    handleModeOfPaymentChange(
      safeParse(`${modeOfPayment}`),
      paymentDetailsSectionIndex
    );

    const scicAuthorizationSectionIndex = sections.findIndex(
      (section) =>
        section.section_name === "SCIC Salary Deduction Authorization"
    );
    const scicAuthorization =
      sections[scicAuthorizationSectionIndex].section_field[0].field_response;

    handleSCICAuthorizationBooleanChange(scicAuthorization as boolean);
  };

  useEffect(() => {
    setIsLoading(true);
    if (!team.team_id) return;
    try {
      const fetchRequestDetails = async () => {
        const formSectionResponseList = await getNonDuplictableSectionResponse(
          supabaseClient,
          {
            requestId,
            fieldIdList: form.form_section.flatMap((section) =>
              section.section_field.map((field) => field.field_id)
            ),
          }
        );

        let formSectionWithResponse = form.form_section.map((section) => {
          let fieldWithResponseList = section.section_field.map((field) => {
            const response = formSectionResponseList.find(
              (response) =>
                response.request_response_field_id === field.field_id
            );
            let field_option = field.field_option ?? [];

            switch (field.field_name) {
              case "Requesting Project":
              case "Project":
                field_option = projectOptions;
                break;
              case "Department":
                field_option = departmentOptions;
                break;
              case "Type of Request":
                field_option = expenseTypeOptions;
                break;
              case "Payment Option":
                field_option = bankListOptions;
                break;
              case "Unit of Measure":
                field_option = uomOptions;
                break;
              default:
                break;
            }

            return {
              ...field,
              field_response: response
                ? safeParse(response.request_response)
                : "",
              field_option,
            };
          });

          if (section.section_name === "Request Details") {
            const isForOfficialBusiness = fieldWithResponseList.find(
              (field) => field.field_name === "Is this for Official Business?"
            )?.field_response;

            if (!Boolean(isForOfficialBusiness)) {
              fieldWithResponseList = fieldWithResponseList.filter(
                (field) => field.field_name !== "Approved Official Business"
              );
            }
          }

          return {
            ...section,
            section_field: fieldWithResponseList,
          };
        });

        const isChargedToProject =
          formSectionWithResponse[1].section_field.find(
            (field) =>
              field.field_name === "Is this request charged to the project?"
          )?.field_response;

        if (!Boolean(isChargedToProject)) {
          formSectionWithResponse = formSectionWithResponse.filter(
            (section) => section.section_name !== "Charge to Project Details"
          );
        }

        replaceSection(formSectionWithResponse);
        setInitialRequestDetails({ sections: formSectionWithResponse });

        handleUpdateConditionalSectionAndField(formSectionWithResponse);
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
                    }}
                    formslyFormName={form.form_name}
                    isEdit={!isReferenceOnly}
                    loadingFieldList={loadingFieldList}
                  />
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

export default EditPettyCashVoucherRequestPage;
