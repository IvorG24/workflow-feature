import { checkIfNavIdIsUnique } from "@/backend/api/get";
import { updateNavId } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestWithResponseType } from "@/utils/types";
import {
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendar, IconId } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  request: RequestWithResponseType;
  requestor: RequestWithResponseType["request_team_member"]["team_member_user"];
  requestDateCreated: string;
  requestStatus: string;
  isPrimarySigner?: boolean;
  requestJiraID?: string | null;
};

const RequestDetailsSection = ({
  request,
  requestor,
  requestDateCreated,
  requestStatus,
  isPrimarySigner,
  requestJiraID,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ navID: string }>({});

  const [isAddingNavID, setIsAddingNavID] = useState(false);
  const [navID, setNavID] = useState(request.request_nav_id);

  const isFormslyRequisitionRequest =
    request.request_form.form_is_formsly_form &&
    request.request_form.form_name === "Requisition";

  const handleUpdateNavID = async ({ navID }: { navID: string }) => {
    try {
      await updateNavId(supabaseClient, {
        requestID: request.request_id,
        navID,
      });
      notifications.show({
        message: "Updated Nav ID.",
        color: "green",
      });
      setNavID(navID);
      setIsAddingNavID(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={2}>{request.request_form.form_name}</Title>
      <Text mt="xs">{request.request_form.form_description}</Text>

      <Title order={5} mt="xl">
        Requested by:
      </Title>
      <Flex gap="md" align="center" mt="xs">
        <Avatar
          size={50}
          src={requestor.user_avatar}
          color={getAvatarColor(Number(`${requestor.user_id.charCodeAt(0)}`))}
          radius="xl"
        >
          {(
            requestor.user_first_name[0] + requestor.user_last_name[0]
          ).toUpperCase()}
        </Avatar>
        <Stack spacing={0}>
          <Text>
            {`${requestor.user_first_name} ${requestor.user_last_name}`}
          </Text>
          <Text color="dimmed" size={14}>
            {" "}
            {requestor.user_username}
          </Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>{requestDateCreated}</Text>
      </Group>
      <Group spacing="md" mt="xs">
        <Text>Status:</Text>
        <Badge color={getStatusToColor(requestStatus.toLowerCase())}>
          {requestStatus}
        </Badge>
      </Group>
      <Group spacing="md" mt="xl">
        <Title order={5}>Request ID:</Title>
        <Text>{request.request_formsly_id ?? request.request_id}</Text>
      </Group>
      {request.request_project.team_project_name && (
        <Group spacing="md" mt="xl">
          <Title order={5}>Requesting Project:</Title>
          <Text>{request.request_project.team_project_name}</Text>
        </Group>
      )}
      {requestJiraID && (
        <Group spacing="md" mt="xl">
          <Title order={5}>Jira ID:</Title>
          <Text>{requestJiraID}</Text>
        </Group>
      )}
      {isFormslyRequisitionRequest &&
        !isAddingNavID &&
        request.request_status === "APPROVED" &&
        !`${router.pathname}`.includes("public-request") &&
        isPrimarySigner && (
          <Group spacing="md" mt="xl">
            <Title order={5}>Nav ID:</Title>
            {navID ? (
              <Text>{navID}</Text>
            ) : (
              <Button variant="light" onClick={() => setIsAddingNavID(true)}>
                Add Nav ID
              </Button>
            )}
          </Group>
        )}
      {isAddingNavID && (
        <form onSubmit={handleSubmit(handleUpdateNavID)}>
          <TextInput
            mt="xl"
            icon={<IconId size={16} />}
            placeholder="Nav ID"
            data-autofocus
            {...register("navID", {
              validate: {
                required: (value) => {
                  if (!value) {
                    return "Nav ID is required.";
                  } else {
                    return true;
                  }
                },
                checkIfUnique: async (value) => {
                  if (
                    await checkIfNavIdIsUnique(supabaseClient, {
                      value: value,
                    })
                  ) {
                    return "Nav ID already exists.";
                  } else {
                    return true;
                  }
                },
              },
            })}
            error={errors.navID?.message}
          />
          <Group spacing="xs" mt="xs" position="right">
            <Button
              disabled={isSubmitting}
              variant="light"
              onClick={() => setIsAddingNavID(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Submit
            </Button>
          </Group>
        </form>
      )}
    </Paper>
  );
};

export default RequestDetailsSection;
