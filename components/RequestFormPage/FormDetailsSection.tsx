import { updateFormVisibility } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { FormType } from "@/utils/types";
import {
  Avatar,
  Flex,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendar } from "@tabler/icons-react";
import { capitalize } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  form: FormType;
};

const FormDetailsSection = ({ form }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const creator = form.form_team_member.team_member_user;
  const [isHidden, setIsHidden] = useState(form.form_is_hidden);
  const router = useRouter();
  const formId = router.query.formId as string;

  const handleToggleVisibility = async (checked: boolean) => {
    try {
      await updateFormVisibility(supabaseClient, {
        formId,
        isHidden: !checked,
      });

      setIsHidden(!checked);

      notifications.show({
        title: "Success!",
        message: `Updated form to as ${!checked ? "hidden" : "visible"}`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    }
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={2}>{form.form_name}</Title>
      <Text mt="xs">{form.form_description}</Text>

      <Title order={5} mt="xl">
        Created by:
      </Title>
      <Flex gap="md" align="center" mt="xs">
        <Avatar
          size={50}
          src={creator.user_avatar}
          color={getAvatarColor(
            Number(`${form.form_team_member.team_member_id.charCodeAt(1)}`)
          )}
          radius="xl"
        >
          {capitalize(creator.user_first_name[0])}
          {capitalize(creator.user_last_name[0])}
        </Avatar>
        <Stack spacing={0}>
          <Text>{`${creator.user_first_name} ${creator.user_last_name}`}</Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>
          {moment(form.form_date_created).format("MMMM DD, YYYY")}
        </Text>
      </Group>
      <Group spacing="md" mt="xl">
        <Switch
          checked={!isHidden}
          onChange={(event) =>
            handleToggleVisibility(event.currentTarget.checked)
          }
          label="Form visibility"
          onLabel="VISIBLE"
          offLabel="HIDDEN"
          size="lg"
        />
      </Group>
    </Paper>
  );
};

export default FormDetailsSection;
