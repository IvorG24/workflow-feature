import { FORMSLY_GROUP } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  CloseButton,
  Divider,
  Flex,
  Group,
  MultiSelect,
  MultiSelectValueProps,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { startCase } from "lodash";
import { Dispatch, SetStateAction, forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";

export type TeamGroupFormType = {
  groupName: string;
  groupMembers: string[];
};

export type SelecteItemType = {
  label: string;
  member: TeamMemberType;
} & React.ComponentPropsWithoutRef<"div">;

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
          {startCase(member.team_member_user.user_first_name[0])}
          {startCase(member.team_member_user.user_last_name[0])}
        </Avatar>

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

const Value = ({
  label,
  onRemove,
  member,
  ...others
}: MultiSelectValueProps & {
  value: string;
  label: string;
  member: TeamMemberType;
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
            {startCase(member.team_member_user.user_first_name[0])}
            {startCase(member.team_member_user.user_last_name[0])}
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

type Props = {
  setIsCreatingTeamGroup: Dispatch<SetStateAction<boolean>>;
  teamMemberList: { value: string; label: string; member: TeamMemberType }[];
  editGroupData?: {
    groupName: string;
    groupMembers: string[];
  };
  handleUpsertGroup: (data: TeamGroupFormType) => void;
};

const CreateTeamGroup = ({
  setIsCreatingTeamGroup,
  teamMemberList,
  editGroupData = { groupName: "", groupMembers: [] },
  handleUpsertGroup,
}: Props) => {
  const { formState, handleSubmit, control } = useForm<TeamGroupFormType>({
    defaultValues: editGroupData,
  });

  const onSubmit = async (data: TeamGroupFormType) => {
    handleUpsertGroup(data);
  };

  return (
    <Stack spacing={12}>
      <Text weight={600}>Add Group</Text>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="md">
          <Controller
            control={control}
            name="groupName"
            render={({ field: { value, onChange } }) => {
              return (
                <Autocomplete
                  value={value}
                  withAsterisk
                  w="100%"
                  label="Group Name"
                  error={formState.errors.groupName?.message}
                  data={FORMSLY_GROUP}
                  onChange={onChange}
                />
              );
            }}
            rules={{
              required: {
                message: "Group Name is required",
                value: true,
              },
              minLength: {
                message: "Group Name must have atleast 3 characters",
                value: 3,
              },
              maxLength: {
                message: "Group Name must be shorter than 500 characters",
                value: 500,
              },
            }}
          />

          <Controller
            control={control}
            name="groupMembers"
            render={({ field: { value, onChange } }) => {
              return (
                <MultiSelect
                  value={value}
                  w="100%"
                  label="Group Members"
                  error={formState.errors.groupMembers?.message}
                  data={teamMemberList}
                  onChange={onChange}
                  itemComponent={SelectItem}
                  valueComponent={Value}
                  nothingFound="Member not found"
                  searchable
                  placeholder="Select group member/s"
                />
              );
            }}
          />
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
          onClick={() => setIsCreatingTeamGroup(false)}
        >
          Cancel
        </Button>
      </form>
    </Stack>
  );
};

export default CreateTeamGroup;
SelectItem.displayName = "SelectItem";
