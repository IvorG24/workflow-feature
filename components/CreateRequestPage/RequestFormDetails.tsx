import { getAvatarColor } from "@/utils/styling";
import { FormType } from "@/utils/types";
import { Avatar, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { capitalize } from "lodash";
import moment from "moment";

type Props = {
  formDetails: {
    form_name: string;
    form_description: string;
    form_date_created: string;
    form_team_member: FormType["form_team_member"];
  };
};

const RequestFormDetails = ({ formDetails }: Props) => {
  const {
    form_name,
    form_description,
    form_date_created,
    form_team_member: {
      team_member_id: formCreatorMemberId,
      team_member_user: formCreator,
    },
  } = formDetails;

  const formDateCreated = moment(form_date_created).format("MMM DD, YYYY");

  return (
    <Paper p="xl" shadow="xs">
      <Title order={2}>{form_name}</Title>
      <Text mt="xs">{form_description}</Text>

      <Title order={5} mt="xl">
        Requested by:
      </Title>
      <Flex gap="md" align="center" mt="xs">
        <Avatar
          size={50}
          src={formCreator.user_avatar}
          color={getAvatarColor(Number(`${formCreatorMemberId.charCodeAt(1)}`))}
          radius="xl"
        >
          {capitalize(formCreator.user_first_name[0])}
          {capitalize(formCreator.user_last_name[0])}
        </Avatar>
        <Stack spacing={0}>
          <Text>
            {`${formCreator.user_first_name} ${formCreator.user_last_name}`}
          </Text>
          <Text color="dimmed"> {formCreator.user_username}</Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>{formDateCreated}</Text>
      </Group>
    </Paper>
  );
};

export default RequestFormDetails;
