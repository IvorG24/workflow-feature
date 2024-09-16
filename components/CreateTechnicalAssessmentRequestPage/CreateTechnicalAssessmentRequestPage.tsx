import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey, startCase } from "@/utils/string";
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
import { EmailNotificationTemplateProps } from "../Resend/EmailNotificationTemplate";

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

const CreateTechnicalAssessmentRequestPage = ({ form }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control } = requestFormMethods;
  const { fields: formSections, replace: replaceSection } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (form.form_section.length === 3) {
      replaceSection([
        {
          ...form.form_section[0],
        },
        {
          ...form.form_section[1],
          section_field: [...form.form_section[1].section_field.slice(1, 6)],
        },
        {
          ...form.form_section[2],
        },
      ]);
    } else {
      replaceSection([
        {
          ...form.form_section[0],
        },
        {
          ...form.form_section[1],
          section_field: [...form.form_section[1].section_field.slice(1, 6)],
        },
      ]);
    }
  }, [form, replaceSection, requestFormMethods]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);
      let requestScore = 0;
      let status = "PENDING";

      const hasMissingTechnicalQuestionSection = data.sections.every(
        (section) => section.section_name !== "Question"
      );

      if (hasMissingTechnicalQuestionSection) {
        notifications.show({
          message: "There is no technical questions yet",
          color: "red",
        });
        setIsLoading(false);
        return;
      }

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
      if (requestScore >= 1) {
        status = "APPROVED";
      } else {
        status = "REJECTED";
      }

      if (status === "APPROVED") {
        const applicantSection = data.sections.find(
          (section) => section.section_name === "Applicant"
        );
        const emailAddress = safeParse(
          applicantSection?.section_field[0].field_response as string
        );
        const firstName = safeParse(
          applicantSection?.section_field[1].field_response as string
        );
        const lastName = safeParse(
          applicantSection?.section_field[3].field_response as string
        );

        const applicantInformationIdSection = data.sections.find(
          (section) => section.section_name === "ID"
        );
        const applicantInformationId = safeParse(
          applicantInformationIdSection?.section_field[0]
            .field_response as string
        );

        const requestLink = `${process.env.NEXT_PUBLIC_SITE_URL}/user/application-progress/${applicantInformationId}`;

        const emailNotificationProps: {
          to: string;
          subject: string;
        } & EmailNotificationTemplateProps = {
          to: emailAddress,
          subject: `Technical Assessment | Sta. Clara International Corporation`,
          greetingPhrase: `Dear ${startCase(firstName)} ${startCase(
            lastName
          )},`,
          message: `
              <p>Congratulations on completing and passing the Assessments!</p>
              <p>
                In line with this, you will be proceeding to HR phone interview.
                Please select your preferred date and time by using the calendar
                link below. Our team will reach out to you based on your
                availability.
              </p>
              <p>
                <a href=${requestLink}>${requestLink}</a>
              </p>
              <p>
                If you have any questions or need assistance, don&apos;t
                hesitate to reach out to us at recruitment@staclara.com.ph.
              </p>
          `,
          closingPhrase: "Best regards,",
          signature: "Sta. Clara International Corporation Recruitment Team",
        };
        await fetch("/api/resend/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailNotificationProps),
        });
      }

      const rootFormslyRequestId = data.sections[0].section_field[0]
        .field_response as string;

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
        rootFormslyRequestId,
      });

      notifications.show({
        message: "Request created.",
        color: "green",
      });

      await router.push(
        `/user/requests/${request.request_formsly_id_prefix}-${request.request_formsly_id_serial}`
      );
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

export default CreateTechnicalAssessmentRequestPage;
