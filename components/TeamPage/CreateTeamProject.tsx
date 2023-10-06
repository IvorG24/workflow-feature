import { startCase } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
import {
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
  TextInput,
  rem,
} from "@mantine/core";
import { Dispatch, SetStateAction, forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";

export type TeamProjectFormType = {
  projectName: string;
  projectMembers: string[];
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
  setIsCreatingTeamProject: Dispatch<SetStateAction<boolean>>;
  teamMemberList: { value: string; label: string; member: TeamMemberType }[];
  editProjectData?: {
    projectName: string;
    projectMembers: string[];
  };
  handleUpsertProject: (data: TeamProjectFormType) => void;
};

const CreateTeamProject = ({
  setIsCreatingTeamProject,
  teamMemberList,
  editProjectData = { projectName: "", projectMembers: [] },
  handleUpsertProject,
}: Props) => {
  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
    watch,
    setValue,
  } = useForm<TeamProjectFormType>({
    defaultValues: editProjectData,
  });

  const onSubmit = async (data: TeamProjectFormType) => {
    handleUpsertProject(data);
  };

  const watchProjectMembers = watch("projectMembers");

  return (
    <Stack spacing={12}>
      <Text weight={600}>Add Project</Text>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="md">
          <TextInput
            label="Project Name"
            withAsterisk
            w="100%"
            {...register("projectName", {
              validate: {
                required: (value) =>
                  value.trim() ? true : "Project Name is required",
                minLength: (value) =>
                  value.trim().length > 2
                    ? true
                    : "Project Name must have atleast 3 characters",
                maxLength: (value) =>
                  value.trim().length < 500
                    ? true
                    : "Project Name must be shorter than 500 characters",
              },
            })}
            sx={{
              input: {
                textTransform: "uppercase",
              },
            }}
            error={errors.projectName?.message}
          />

          <Controller
            control={control}
            name="projectMembers"
            render={({ field: { value, onChange } }) => {
              return (
                <MultiSelect
                  value={value}
                  w="100%"
                  label="Project Members"
                  error={errors.projectMembers?.message}
                  data={teamMemberList}
                  onChange={onChange}
                  itemComponent={SelectItem}
                  valueComponent={Value}
                  nothingFound="Member not found"
                  searchable
                  placeholder="Select project member/s"
                />
              );
            }}
          />

          {watchProjectMembers.length < teamMemberList.length ? (
            <Button
              variant="subtle"
              onClick={() => {
                setValue(
                  "projectMembers",
                  teamMemberList.map((member) => member.value)
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
          onClick={() => setIsCreatingTeamProject(false)}
        >
          Cancel
        </Button>
      </form>
    </Stack>
  );
};

export default CreateTeamProject;
SelectItem.displayName = "SelectItem";
