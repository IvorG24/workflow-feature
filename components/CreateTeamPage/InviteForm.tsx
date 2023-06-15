import { createTeamInvitation } from "@/backend/api/post";
import { InvitationTableRow, TeamMemberTableRow } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  List,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconCircleCheck,
  IconMail,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import validator from "validator";

type FormValues = {
  invites: {
    email: string;
  }[];
};

type Props = {
  changeStep: Dispatch<SetStateAction<number>>;
  ownerData: TeamMemberTableRow;
  teamName: string | undefined;
};

const InviteForm = ({ changeStep, ownerData, teamName }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [invitationList, setInvitationList] = useState<InvitationTableRow[]>(
    []
  );
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { invites: [{ email: "" }] },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "invites",
  });
  const inviteList = useWatch({ name: "invites", control });

  const handleSendInvite = async (data: FormValues) => {
    try {
      if (!teamName) return;

      setIsSendingInvites(true);
      const emailList = data.invites.map((invite) => invite.email);
      const invitationData = await createTeamInvitation(supabaseClient, {
        emailList,
        teamMemberId: ownerData.team_member_id,
        teamName: teamName,
      });

      if (invitationData.length > 0) {
        setInvitationList((prev) => [...prev, ...invitationData]);
        replace([{ email: "" }]);
        notifications.show({
          message: "Invitation sent.",
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleRemoveInvite = (index: number) => {
    if (index === 0) {
      setValue(`invites.${index}.email`, "");
      return;
    } else {
      remove(index);
    }
  };

  return (
    <Paper p={42}>
      <Stack>
        <form onSubmit={handleSubmit(handleSendInvite)}>
          <Stack>
            <LoadingOverlay visible={isSendingInvites} overlayBlur={2} />
            <Box>
              <Title order={4}>Invite your team</Title>
              <Text>
                Your new team has been created. Invite your members to
                collaborate on this team.
              </Text>
            </Box>
            <Stack spacing="xs">
              {fields.map((invite, index) => (
                <Box key={invite.id} mt="xs">
                  <Group>
                    <TextInput
                      icon={<IconMail size={16} />}
                      placeholder="Add member email address"
                      {...register(`invites.${index}.email`, {
                        validate: {
                          isEmail: (v) =>
                            validator.isEmail(v) || "Email is invalid.",
                          isDuplicate: (v) =>
                            inviteList.filter((invite) => invite.email === v)
                              .length <= 1 || "This email is duplicate.",
                          isInvited: (v) =>
                            !invitationList.find(
                              (invite) => invite.invitation_to_email === v
                            ) || "This email is already invited.",
                        },
                      })}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      onClick={() => handleRemoveInvite(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                  <Text color="red" size="xs">
                    {errors.invites && errors.invites[index]?.email?.message}
                  </Text>
                </Box>
              ))}
            </Stack>
            <Button
              px={0}
              w="fit-content"
              variant="subtle"
              type="button"
              leftIcon={<IconPlus size={14} />}
              onClick={() => append({ email: "" })}
            >
              Add another
            </Button>

            <Button size="md" type="submit">
              Send Invites
            </Button>
          </Stack>
        </form>
        {invitationList.length > 0 && (
          <Stack mt="xl">
            <Title order={4}>Invitation List</Title>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconCircleCheck size="1rem" />
                </ThemeIcon>
              }
            >
              {invitationList.map((invite) => (
                <List.Item key={invite.invitation_id}>
                  {invite.invitation_to_email}
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        <Flex gap="md" wrap="nowrap">
          <Button
            size="md"
            style={{ flex: 1 }}
            variant="outline"
            onClick={() => changeStep((prev) => prev + 1)}
          >
            {invitationList && invitationList.length > 0 ? "Done" : "Skip"}
          </Button>
        </Flex>
      </Stack>
    </Paper>
  );
};

export default InviteForm;
