import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Database } from "oneoffice-api";
import { useEffect } from "react";
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
};

const CreateOnlineApplicationRequestPage = ({ form }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };
  // const signerList = form.form_signer.map((signer) => ({
  //   ...signer,
  //   signer_action: signer.signer_action.toUpperCase(),
  // }));

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control } = requestFormMethods;
  const { fields: formSections, replace: replaceSection } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    replaceSection(form.form_section);
  }, [form, replaceSection, requestFormMethods]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);

      let requestScore = 0;
      let status = "PENDING";
      data.sections.forEach((section) => {
        section.section_field.forEach((field) => {
          if (
            field.field_response ===
            field.field_correct_response?.correct_response_value
          ) {
            requestScore += 1;
          }
        });
      });
      if (requestScore >= 6) {
        status = "APPROVED";
      } else {
        status = "REJECTED";
      }

      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId: form.form_id,
        signers: form.form_signer,
        teamId: "a5a28977-6956-45c1-a624-b9e90911502e",
        requesterName: data.sections[1].section_field
          .slice(1, 4)
          .map((field) => field.field_response)
          .join(" "),
        formName: form.form_name,
        isFormslyForm: true,
        projectId: "",
        teamName: formatTeamNameToUrlKey(
          process.env.NODE_ENV === "production" ? "SCIC" : "Sta Clara"
        ),
        status,
        requestScore,
      });
      notifications.show({
        message: "Request created.",
        color: "green",
      });

      await router.push(`/public-request/${request.request_id}`);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
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
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    formslyFormName={form.form_name}
                    isPublicRequest={true}
                  />
                </Box>
              );
            })}
            {/* <RequestFormSigner signerList={signerList} /> */}
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateOnlineApplicationRequestPage;
