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
};

const CreateWorkingAdvanceVoucherRequestPage = ({
  form,
  projectOptions,
  departmentOptions,
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
      console.log(error);
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
        `sections.0.section_field.0.field_response`
      );
      const selectedDepartment = getValues(
        `sections.0.section_field.2.field_response`
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
    } catch (e) {
      setValue(`sections.0.section_field.0.field_response`, "");
      setValue(`sections.0.section_field.2.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handleWorkingAdvanceVoucherBooleanChange = async (
    value: boolean,
    sectionIndex: number
  ) => {
    try {
      const selectedSection = getValues(`sections.${sectionIndex}`);

      if (value) {
        updateSection(sectionIndex, {
          ...selectedSection,
          section_field: [
            ...selectedSection.section_field,
            form.form_section[0].section_field[9],
          ],
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
      console.log(error);
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

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        if (!activeTeam.team_id) return;
        // add project options
        const sectionWithProjectOptions = {
          ...form.form_section[0],
          section_field: [
            {
              ...form.form_section[0].section_field[0],
              field_option: projectOptions,
            },
            form.form_section[0].section_field[1],
            {
              ...form.form_section[0].section_field[2],
              field_option: departmentOptions,
            },
            ...form.form_section[0].section_field.slice(3, 9),
          ],
        };
        replaceSection([sectionWithProjectOptions]);
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
                    workingAdvanceVoucherFormMethods={{
                      onProjectOrDepartmentNameChange:
                        handleProjectOrDepartmentNameChange,
                      onWorkingAdvanceVoucherBooleanChange:
                        handleWorkingAdvanceVoucherBooleanChange,
                      onEmployeeNumberChange: handleEmployeeNumberChange,
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

export default CreateWorkingAdvanceVoucherRequestPage;
