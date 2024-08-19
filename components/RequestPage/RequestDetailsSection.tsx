import { checkIfOtpIdIsUnique } from "@/backend/api/get";
import { updateOtpId } from "@/backend/api/update";
import { formatDate, formatTime } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getJiraTicketStatusColor } from "@/utils/styling";
import { RequestWithResponseType } from "@/utils/types";
import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  Space,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconId } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  request: RequestWithResponseType;
  requestor: RequestWithResponseType["request_team_member"]["team_member_user"];
  requestDateCreated: string;
  requestStatus: string;
  isPrimarySigner?: boolean;
  requestJira?: {
    id: string | null;
    link: string | null;
  };
  jiraTicketStatus?: string | null;
};

const RequestDetailsSection = ({
  request,
  requestor,
  requestDateCreated,
  requestStatus,
  isPrimarySigner,
  requestJira,
  jiraTicketStatus,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ otpID: string }>({});

  const [isAddingOtpID, setIsAddingOtpID] = useState(false);
  const [otpID, setOtpID] = useState(request.request_otp_id);

  const isFormslyItemRequest =
    request.request_form.form_is_formsly_form &&
    ["Item", "Services", "PED Equipment", "PED Part"].includes(
      request.request_form.form_name
    );

  const handleUpdateOtpID = async ({ otpID }: { otpID: string }) => {
    try {
      await updateOtpId(supabaseClient, {
        requestID: request.request_id,
        otpID,
      });
      notifications.show({
        message: "Updated OTP ID.",
        color: "green",
      });
      setOtpID(otpID);
      setIsAddingOtpID(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const primarySigner = request.request_signer.find(
    (signer) => signer.request_signer_signer.signer_is_primary_signer
  );

  const fieldList = [
    {
      label: "Form Name",
      value: request.request_form.form_name,
    },
    {
      label: "Form Description",
      value: request.request_form.form_description,
    },
    {
      label: "Date Created",
      value: formatDate(new Date(requestDateCreated)),
    },
    ...(request.request_form.form_type && request.request_form.form_sub_type
      ? [
          {
            label: "Type",
            value: request.request_form.form_type,
          },
          {
            label: "Sub Type",
            value: request.request_form.form_sub_type,
          },
        ]
      : []),
    ...(requestor.user_first_name
      ? [
          {
            label: "Requested by",
            value: `${requestor.user_first_name} ${requestor.user_last_name}`,
          },
        ]
      : []),
    {
      label: "Status",
      value: requestStatus,
    },
    ...(primarySigner &&
    primarySigner.request_signer_status_date_updated &&
    ["APPROVED", "REJECTED"].includes(request.request_status)
      ? [
          {
            label: "Date Updated",
            value: `${formatDate(
              new Date(primarySigner.request_signer_status_date_updated)
            )} ${formatTime(
              new Date(primarySigner.request_signer_status_date_updated)
            )}`,
          },
        ]
      : []),
    {
      label: "Request ID",
      value:
        request.request_formsly_id === "-"
          ? request.request_id
          : request.request_formsly_id,
    },
    ...(request.request_project.team_project_name
      ? [
          {
            label: "Requesting Project",
            value: request.request_project.team_project_name,
          },
        ]
      : []),
  ];

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Metadata
      </Title>
      <Space h="xl" />
      <Stack spacing="xs">
        {fieldList.map((field, index) => {
          if (field.label === "Form Description") {
            return (
              <Textarea
                key={index}
                label={field.label}
                value={field.value}
                readOnly
                variant="filled"
              />
            );
          } else {
            return (
              <TextInput
                key={index}
                label={field.label}
                value={field.value}
                readOnly
                variant="filled"
              />
            );
          }
        })}

        {requestJira?.id && (
          <Group spacing="md" mt="xl">
            <Title order={5}>Jira ID:</Title>
            <Text>
              <Anchor
                href={
                  requestJira.link
                    ? requestJira.link?.slice(0, 8) !== "https://"
                      ? `https://${requestJira.link}`
                      : requestJira.link
                    : "#"
                }
                target="_blank"
              >
                {requestJira.id}
              </Anchor>
            </Text>
            {jiraTicketStatus && (
              <Badge
                color={getJiraTicketStatusColor(jiraTicketStatus.toLowerCase())}
              >
                {jiraTicketStatus}
              </Badge>
            )}
          </Group>
        )}
        {isFormslyItemRequest &&
          !isAddingOtpID &&
          requestStatus === "APPROVED" &&
          !`${router.pathname}`.includes("public-request") &&
          isPrimarySigner && (
            <Group spacing="md" mt="xl">
              <Title order={5}>OTP ID:</Title>
              {otpID ? (
                <Text>{otpID}</Text>
              ) : (
                <Button variant="light" onClick={() => setIsAddingOtpID(true)}>
                  Add OTP ID
                </Button>
              )}
            </Group>
          )}
        {isAddingOtpID && (
          <form onSubmit={handleSubmit(handleUpdateOtpID)}>
            <TextInput
              mt="xl"
              icon={<IconId size={16} />}
              placeholder="OTP ID"
              data-autofocus
              {...register("otpID", {
                validate: {
                  required: (value) => {
                    if (!value) {
                      return "OTP ID is required.";
                    } else {
                      return true;
                    }
                  },
                  checkIfUnique: async (value) => {
                    if (
                      await checkIfOtpIdIsUnique(supabaseClient, {
                        value: value,
                      })
                    ) {
                      return "OTP ID already exists.";
                    } else {
                      return true;
                    }
                  },
                },
              })}
              error={errors.otpID?.message}
            />
            <Group spacing="xs" mt="xs" position="right">
              <Button
                disabled={isSubmitting}
                variant="light"
                onClick={() => setIsAddingOtpID(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Submit
              </Button>
            </Group>
          </form>
        )}
      </Stack>
    </Paper>
  );
};

export default RequestDetailsSection;
