import { getTeamMembersWithMemberRole } from "@/backend/api/get";
import { updateApproverRole } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
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
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { SelecteItemType } from "../CreateTeamProject";
import { TeamApproverChoiceType, TeamApproverType } from "./ApproverGroup";

const Value = ({
  label,
  onRemove,
  member,
  ...others
}: MultiSelectValueProps & {
  value: string;
  label: string;
  member: TeamApproverChoiceType;
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
  approvers: string[];
};

type Props = {
  teamId: string;
  setIsAddingApprover: Dispatch<SetStateAction<boolean>>;
  setApproverList: Dispatch<SetStateAction<TeamApproverType[]>>;
  setApproverListCount: Dispatch<SetStateAction<number>>;
};

const AddTeamApprover = ({
  teamId,
  setIsAddingApprover,
  setApproverList,
  setApproverListCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [approverChoiceList, setApproverChoiceList] = useState<
    {
      label: string;
      value: string;
      member: TeamApproverChoiceType;
    }[]
  >([]);
  const [isFetchingChoices, setIsFetchingChoices] = useState(true);

  useEffect(() => {
    try {
      setIsFetchingChoices(true);
      const fetchChoices = async () => {
        const choices = await getTeamMembersWithMemberRole(supabaseClient, {
          teamId,
        });
        const teamMemberChoices =
          choices as unknown as TeamApproverChoiceType[];
        const formattedChoices = teamMemberChoices.map((member) => {
          return {
            label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
            value: member.team_member_id,
            member: member,
          };
        });
        setApproverChoiceList(formattedChoices);
      };
      fetchChoices();
    } catch (e) {
      notifications.show({
        message: "Error on fetching group approver list",
        color: "red",
      });
    } finally {
      setIsFetchingChoices(false);
    }
  }, []);

  const { formState, handleSubmit, control, setValue, watch } =
    useForm<GroupForm>({
      defaultValues: {
        approvers: [],
      },
    });

  const onSubmit = async (data: GroupForm) => {
    try {
      const newApproverList = await updateApproverRole(supabaseClient, {
        teamApproverIdList: data.approvers,
        updateRole: "APPROVER",
      });

      setApproverList((prev) => {
        prev.unshift(...newApproverList);
        return prev;
      });
      setApproverListCount((prev) => prev + data.approvers.length);
      notifications.show({
        message: "Team approver/s added.",
        color: "green",
      });
      setIsAddingApprover(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
    }
  };

  const watchGroupApprovers = watch("approvers");

  return (
    <Container p={0} fluid sx={{ position: "relative" }}>
      <LoadingOverlay visible={formState.isSubmitting || isFetchingChoices} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add Approver
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <Controller
              control={control}
              name="approvers"
              render={({ field: { value, onChange } }) => (
                <MultiSelect
                  value={value as string[]}
                  onChange={(value) => onChange(value)}
                  data={approverChoiceList}
                  withAsterisk
                  error={formState.errors.approvers?.message}
                  searchable
                  valueComponent={Value}
                  itemComponent={SelectItem}
                  nothingFound="Member not found"
                  placeholder="Select group approver/s"
                />
              )}
              rules={{ required: "Approver/s is/are required" }}
            />
            {watchGroupApprovers.length < approverChoiceList.length ? (
              <Button
                variant="subtle"
                onClick={() => {
                  setValue(
                    "approvers",
                    approverChoiceList.map((choice) => choice.value)
                  );
                }}
              >
                Select all team approvers
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
            onClick={() => setIsAddingApprover(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default AddTeamApprover;
SelectItem.displayName = "SelectItem";
