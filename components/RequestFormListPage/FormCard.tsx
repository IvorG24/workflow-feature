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
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@tabler/icons-react";
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

  return (
    <Paper
      withBorder
      miw={{ base: "100%", xs: 245 }}
      mih={170}
      shadow="sm"
      p="xl"
      py="md"
    >
      <Flex direction="column" justify="space-between" mih={138}>
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
            {/* todo: change into creator label and avatar */}
            <Tooltip label="John Doe">
              <Avatar
                src={
                  "https://avatars.githubusercontent.com/u/10353856?s=460&u=88394dfd67727327c1f7670a1764dc38a8a24831&v=4"
                }
                radius={18}
                size={18}
              ></Avatar>
            </Tooltip>
            <Text size="xs" color="dimmed">
              Created {moment(form.form_date_created).fromNow()}
            </Text>
          </Group>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon size="xs">
                <IconDotsVertical size={12} />
              </ActionIcon>
            </Menu.Target>

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

              <Menu.Item
                onClick={onDeleteForm}
                color="red"
                icon={<IconTrash size={14} />}
              >
                Delete Form
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </Paper>
  );
};

export default FormCard;
