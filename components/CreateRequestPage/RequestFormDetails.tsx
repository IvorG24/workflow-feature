import { useUserIntials, useUserProfile } from "@/stores/useUserStore";
import { getAvatarColor } from "@/utils/styling";
import { FormType } from "@/utils/types";
import { Avatar, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import moment from "moment";

type Props = {
  formDetails: {
    form_name: string;
    form_description: string;
    form_date_created: string;
    form_team_member: FormType["form_team_member"];
  };
  requestingProject?: string;
};

const RequestFormDetails = ({ formDetails, requestingProject }: Props) => {
  const userInitials = useUserIntials();
  const userProfile = useUserProfile();

  const { form_name, form_description } = formDetails;

  const requestDate = moment(new Date()).format("MMM DD, YYYY");

  return (
    <Paper
      p="xl"
      shadow="xs"
      className="onboarding-create-request-form-details"
    >
      <Title order={2}>{form_name}</Title>
      <Text mt="xs">{form_description}</Text>

      <Title order={5} mt="xl">
        Requested by:
      </Title>
      <Flex gap="md" align="center" mt="xs">
        <Avatar
          size={50}
          src={userProfile?.user_avatar}
          color={getAvatarColor(
            Number(`${userProfile?.user_id.charCodeAt(0)}`)
          )}
          radius="xl"
        >
          {userInitials}
        </Avatar>
        <Stack spacing={0}>
          <Text>
            {`${userProfile?.user_first_name} ${userProfile?.user_last_name}`}
          </Text>
          <Text color="dimmed" size={14}>
            {userProfile?.user_username}
          </Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>{requestDate}</Text>
      </Group>
      {requestingProject && (
        <Group spacing="md" mt="xl">
          <Title order={5}>Requesting Project:</Title>
          <Text>{requestingProject}</Text>
        </Group>
      )}
    </Paper>
  );
};

export default RequestFormDetails;
