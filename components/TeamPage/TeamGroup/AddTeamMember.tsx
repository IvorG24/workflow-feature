import { insertGroupMember } from "@/backend/api/post";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { TeamGroupTableRow } from "@/utils/types";
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  MultiSelect,
  MultiSelectValueProps,
  Stack,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { SelecteItemType } from "../CreateTeamProject";
import { TeamMemberChoiceType } from "./GroupMembers";

const Value = ({
  label,
  onRemove,
  member,
  ...others
}: MultiSelectValueProps & {
  value: string;
  label: string;
  member: TeamMemberChoiceType;
}) => {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          border: `${rem(1)} solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[4]
          }`,
          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Box mr={10}>
          <Avatar
            size="xs"
            src={member.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${member.team_member_user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              member.team_member_user.user_first_name[0] +
              member.team_member_user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
        </Box>
        <Box sx={{ lineHeight: 1, fontSize: rem(12) }}>{label}</Box>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
};

const SelectItem = forwardRef<HTMLDivElement, SelecteItemType>(
  ({ label, member, ...others }: SelecteItemType, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar
          size="xs"
          src={member.team_member_user.user_avatar}
          color={getAvatarColor(
            Number(`${member.team_member_user.user_id.charCodeAt(0)}`)
          )}
        >
          {(
            member.team_member_user.user_first_name[0] +
            member.team_member_user.user_last_name[0]
          ).toUpperCase()}
        </Avatar>

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

type GroupForm = {
  groupMembers: string[];
  teamProjects: string[];
};

type Props = {
  setIsAddingMember: Dispatch<SetStateAction<boolean>>;
  groupMemberChoiceList: {
    label: string;
    value: string;
    member: TeamMemberChoiceType;
  }[];
  selectedGroup: TeamGroupTableRow;
  teamProjectChoiceList: {
    label: string;
    value: string;
  }[];
  fetchGroupMembers: () => Promise<void>;
};

const AddTeamMember = ({
  setIsAddingMember,
  groupMemberChoiceList,
  selectedGroup,
  teamProjectChoiceList,
  fetchGroupMembers,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const { formState, handleSubmit, control, setValue, watch } =
    useForm<GroupForm>({
      defaultValues: {
        groupMembers: [],
        teamProjects: [],
      },
    });

  const onSubmit = async (data: GroupForm) => {
    try {
      await insertGroupMember(supabaseClient, {
        groupId: selectedGroup.team_group_id,
        teamMemberIdList: data.groupMembers,
        teamProjectIdList: data.teamProjects,
      });
      await fetchGroupMembers();
      notifications.show({
        message: "Team memeber/s added.",
        color: "green",
      });
      setIsAddingMember(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    return;
  };

  const watchGroupMembers = watch("groupMembers");

  return (
    <Container p={0} fluid sx={{ position: "relative" }}>
      <LoadingOverlay visible={formState.isSubmitting} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add Member
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <Controller
              control={control}
              name="teamProjects"
              render={({ field: { value, onChange } }) => (
                <MultiSelect
                  value={value as string[]}
                  onChange={(value) => onChange(value)}
                  data={teamProjectChoiceList}
                  error={formState.errors.teamProjects?.message}
                  searchable
                  nothingFound="Project not found"
                  placeholder="Select team projects"
                  label="Team projects"
                />
              )}
            />
            <Controller
              control={control}
              name="groupMembers"
              render={({ field: { value, onChange } }) => (
                <MultiSelect
                  value={value as string[]}
                  onChange={(value) => onChange(value)}
                  data={groupMemberChoiceList}
                  withAsterisk
                  error={formState.errors.groupMembers?.message}
                  searchable
                  valueComponent={Value}
                  itemComponent={SelectItem}
                  nothingFound="Member not found"
                  placeholder="Select group members"
                  label="Group members"
                />
              )}
              rules={{ required: "Group member/s is/are required" }}
            />
            {watchGroupMembers.length < groupMemberChoiceList.length ? (
              <Button
                variant="subtle"
                onClick={() => {
                  setValue(
                    "groupMembers",
                    groupMemberChoiceList.map((choice) => choice.value)
                  );
                }}
              >
                Select all team members
              </Button>
            ) : null}
          </Flex>

          <Button type="submit" miw={100} mt={30} mr={14}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            miw={100}
            mt={30}
            mr={14}
            onClick={() => setIsAddingMember(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default AddTeamMember;
SelectItem.displayName = "SelectItem";
