import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { FormWithOwnerType } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Flex,
  Group,
  Menu,
  Paper,
  Text,
  Title,
  Tooltip,
  createStyles,
  useMantineColorScheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@tabler/icons-react";
import { startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { MouseEventHandler } from "react";

const useStyles = createStyles(() => ({
  formName: {
    cursor: "pointer",
  },
}));

type Props = {
  form: FormWithOwnerType;
  onDeleteForm: MouseEventHandler<HTMLButtonElement>;
  onHideForm: MouseEventHandler<HTMLButtonElement>;
};

const FormCard = ({ form, onDeleteForm, onHideForm }: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const { ref, hovered: isFormNameHovered } = useHover();
  const { colorScheme } = useMantineColorScheme();

 

  return (
    <Paper
      withBorder
      miw={{ base: "100%", xs: 245 }}
      mih={170}
      maw={245}
      shadow="sm"
      p="xl"
      py="md"
    >
      <Flex direction="column" justify="space-between" mih={150}>
        <Flex direction="column">
          <Anchor
            onClick={() => router.push(`/team-requests/forms/${form.form_id}`)}
          >
            <Tooltip
              label={form.form_name}
              openDelay={2000}
              maw={197}
              multiline
            >
              <Title
                ref={ref}
                order={3}
                size={18}
                weight="600"
                lineClamp={2}
                underline={isFormNameHovered}
                className={classes.formName}
              >
                {form.form_name}
              </Title>
            </Tooltip>
          </Anchor>
          <Tooltip
            label={form.form_description}
            openDelay={2000}
            maw={197}
            multiline
          >
            <Text size={12} lineClamp={2} mt="xs" w={{ base: "100%", xs: 197 }}>
              {form.form_description}
            </Text>
          </Tooltip>
        </Flex>
        {form.form_is_hidden && (
          <Badge w={82}>
            <Flex direction="row" gap={4} align="center">
              <IconEyeOff size={14} />
              <Text size={10}>Hidden</Text>
            </Flex>
          </Badge>
        )}
        <Flex justify="space-between">
          <Group spacing={4}>
            <Tooltip
              label={
                form.form_is_formsly_form
                  ? "Formsly"
                  : `${form.form_team_member.team_member_user.user_first_name} ${form.form_team_member.team_member_user.user_last_name}`
              }
              openDelay={400}
            >
              <Avatar
                src={
                  form.form_is_formsly_form
                    ? `/icon-request-${
                        colorScheme === "light" ? "light" : "dark"
                      }.svg`
                    : form.form_team_member.team_member_user.user_avatar
                }
                radius={18}
                size={18}
                color={getAvatarColor(
                  Number(
                    `${form.form_team_member.team_member_user.user_id.charCodeAt(
                      0
                    )}`
                  )
                )}
              >
                {startCase(
                  form.form_team_member.team_member_user.user_first_name[0]
                )}
                {startCase(
                  form.form_team_member.team_member_user.user_last_name[1]
                )}
              </Avatar>
            </Tooltip>
            <Tooltip
              label={moment(form.form_date_created).format(
                "MMMM Do YYYY, h:mm:ss a"
              )}
              openDelay={400}
            >
              <Text size="xs" color="dimmed">
                Created {moment(form.form_date_created).fromNow()}
              </Text>
            </Tooltip>
          </Group>

          <Menu shadow="md" width={200} position="bottom-end">
            {!UNHIDEABLE_FORMLY_FORMS.includes(form.form_name) ? (
              <Menu.Target>
                <ActionIcon size="xs">
                  <IconDotsVertical size={12} />
                </ActionIcon>
              </Menu.Target>
            ) : null}

            <Menu.Dropdown>
              <Menu.Item
                onClick={onHideForm}
                icon={
                  form.form_is_hidden ? (
                    <IconEye size={14} />
                  ) : (
                    <IconEyeOff size={14} />
                  )
                }
              >
                {`${form.form_is_hidden ? "Unhide" : "Hide"} Form`}
              </Menu.Item>

              {!form.form_is_formsly_form ? (
                <Menu.Item
                  onClick={onDeleteForm}
                  color="red"
                  icon={<IconTrash size={14} />}
                >
                  Delete Form
                </Menu.Item>
              ) : null}
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </Paper>
  );
};

export default FormCard;
