import {
  getFormProjectIDs,
  getProjectByID,
  getSignerWithProfile,
} from "@/backend/api/get";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { toTitleCase } from "@/utils/string";
import { FormSLAWithForm } from "@/utils/types";
import { Button, Container, Flex, Select, SelectProps } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

export type SLAFormValues = {
  formId: string;
  projectId: string;
  singerId: string;
  status: "PASSED" | "FAILED" | "ALL";
};

type OptionList = SelectProps["data"];
type Props = {
  slaFormList: FormSLAWithForm[];
  onSearch: () => void;
};

const SignerSLAListFilter = ({ slaFormList, onSearch }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<SLAFormValues>();

  const formOptions = slaFormList
    .map((slaForm) => ({
      label: slaForm.form_table.form_name,
      value: slaForm.form_sla_form_id,
      disabled: slaForm.form_sla_hours <= 0,
    }))
    .filter((form) => !UNHIDEABLE_FORMLY_FORMS.includes(form.label))
    .sort((a, b) => (a.value === b.value ? 0 : a.value ? -1 : 1));

  const [projectList, setProjectList] = useState<OptionList | null>(null);
  const [signerList, setSignerList] = useState<OptionList | null>(null);
  const [isFormslyForm, setIsFormslyForm] = useState(true);
  const [isFormChanging, setIsFormChanging] = useState(false);
  const [isProjectChanging, setIsProjectgChanging] = useState(false);

  const statusOptions = [
    { label: "All", value: "ALL" },
    { label: "Passed", value: "PASSED" },
    { label: "Failed", value: "FAILED" },
  ];

  const onFormChange = async (formId: string) => {
    try {
      setIsFormChanging(true);

      setValue("projectId", "");
      setValue("singerId", "");

      const selectedForm = slaFormList.find(
        (form) => form.form_sla_form_id === formId
      );
      if (selectedForm && selectedForm.form_table.form_is_formsly_form) {
        setIsFormslyForm(true);
        const projectIdList = await getFormProjectIDs(supabaseClient, {
          formId,
        });
        const projects = await getProjectByID(supabaseClient, {
          projectIdList,
        });
        const projectOptions = projects.map((project) => ({
          label: toTitleCase(project.team_project_name),
          value: project.team_project_id,
        }));
        setProjectList(projectOptions);
      } else {
        setIsFormslyForm(false);
        await onProjectChange("");
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFormChanging(false);
    }
  };

  const onProjectChange = async (projectId: string) => {
    try {
      setIsProjectgChanging(true);
      const signerWithProfile = await getSignerWithProfile(supabaseClient, {
        projectId,
        formId: getValues("formId"),
      });
      const signerOptions = signerWithProfile.map((signer) => ({
        label: toTitleCase(
          `${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name}`
        ),
        value: signer.signer_id,
      }));
      setValue("singerId", "");
      setSignerList(signerOptions);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsProjectgChanging(false);
    }
  };

  return (
    <Container p={0} mt="md">
      <Flex gap="xs" wrap="wrap" align="center">
        <Controller
          control={control}
          name="formId"
          rules={{ required: "Form is required" }}
          render={({ field: fieldProps }) => (
            <Select
              {...fieldProps}
              onChange={(value) => {
                setProjectList(null);
                setSignerList(null);
                fieldProps.onChange(value);
                if (value) onFormChange(value);
              }}
              placeholder="Select a form"
              data={formOptions}
              error={errors.formId?.message}
            />
          )}
        />
        {isFormslyForm && (
          <Controller
            control={control}
            name="projectId"
            rules={{ required: isFormslyForm ? "Project is required" : false }}
            render={({ field: fieldProps }) => (
              <Select
                {...fieldProps}
                onChange={(value) => {
                  fieldProps.onChange(value);
                  if (value) onProjectChange(value);
                }}
                placeholder="Select a project"
                onDropdownOpen={() => {
                  if (projectList === null) {
                    notifications.show({
                      message: "Please select a form first then try again",
                      color: "orange",
                    });
                  }
                }}
                data={projectList || []}
                disabled={isFormChanging}
                error={errors.projectId?.message}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="singerId"
          rules={{ required: "Approver is required" }}
          render={({ field: fieldProps }) => (
            <Select
              {...fieldProps}
              placeholder="Select an approver"
              onDropdownOpen={() => {
                if (isFormslyForm && signerList === null) {
                  notifications.show({
                    message: "Please select a project first then try again",
                    color: "orange",
                  });
                }
              }}
              data={signerList || []}
              disabled={isProjectChanging || isFormChanging}
              error={errors.singerId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          defaultValue="ALL"
          render={({ field: fieldProps }) => (
            <Select
              {...fieldProps}
              data={statusOptions}
              clearable={false}
              w={95}
            />
          )}
        />

        <Button type="submit" px="xs" onClick={onSearch}>
          <IconSearch />
        </Button>
      </Flex>
    </Container>
  );
};

export default SignerSLAListFilter;
