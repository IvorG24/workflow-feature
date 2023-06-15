import { updateFormVisibility } from "@/backend/api/update";
import { useFormActions, useFormList } from "@/stores/useFormStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
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
  formVisibilityRestriction?: () => Promise<string | boolean | undefined>;
};

const FormDetailsSection = ({ form, formVisibilityRestriction }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const creator = form.form_team_member.team_member_user;
  const router = useRouter();
  const formId = router.query.formId as string;

  const formList = useFormList();
  const { setFormList } = useFormActions();

  const [isHidden, setIsHidden] = useState(form.form_is_hidden);

  const handleToggleVisibility = async (checked: boolean) => {
    setIsHidden(!checked);
    try {
      await updateFormVisibility(supabaseClient, {
        formId,
        isHidden: !checked,
      });

      const newForm = formList.map((form) => {
        if (form.form_id !== formId) return form;
        return { ...form, form_is_hidden: !isHidden };
      });
      setFormList(newForm);

      notifications.show({
        message: `Form visibility udpated to ${
          !checked ? "hidden" : "visible"
        }`,
        color: "green",
      });
    } catch (error) {
      setIsHidden(checked);
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
            Number(`${form.form_team_member.team_member_id.charCodeAt(0)}`)
          )}
          radius="xl"
        >
          {capitalize(creator.user_first_name[0])}
          {capitalize(creator.user_last_name[0])}
        </Avatar>
        <Stack spacing={0}>
          <Text>{`${creator.user_first_name} ${creator.user_last_name}`}</Text>
          <Text size={14} color="dimmed">{`${creator.user_username}`}</Text>
        </Stack>
      </Flex>
      <Group spacing="md" mt="xl">
        <IconCalendar />
        <Text weight={600}>
          {moment(form.form_date_created).format("MMMM DD, YYYY")}
        </Text>
      </Group>
      <Group spacing="md" mt="xl">
        {!form.form_is_formsly_form ||
        (form.form_is_formsly_form &&
          !UNHIDEABLE_FORMLY_FORMS.includes(form.form_name)) ? (
          <Switch
            checked={!isHidden}
            onChange={async (event) => {
              if (
                formVisibilityRestriction &&
                event.currentTarget.checked === true
              ) {
                const result = await formVisibilityRestriction();
                if (result === true) {
                  handleToggleVisibility(true);
                } else {
                  notifications.show({
                    message: result,
                    color: "orange",
                  });
                }
              } else {
                handleToggleVisibility(event.currentTarget.checked);
              }
            }}
            label="Form visibility"
            size="sm"
            sx={{ label: { cursor: "pointer" } }}
          />
        ) : null}
      </Group>
    </Paper>
  );
};

export default FormDetailsSection;
