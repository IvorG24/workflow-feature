import { getTeamInvitation } from "@/backend/api/get";
import { checkIfEmailExists, createTeamInvitation } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  MultiSelect,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconMailPlus, IconUsersPlus } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import validator from "validator";

type Props = {
  memberEmailList: string[];
};

type EmailListData = { value: string; label: string }[];

type PendingInvite = {
  invitation_id: string;
  invitation_to_email: string;
  invitation_date_created: string;
  team_member: {
    team_member_team_id: string;
  };
  is_resend_disabled?: boolean;
};

const InviteMember = ({ memberEmailList }: Props) => {
  const team = useActiveTeam();
  const teamMember = useUserTeamMember();
  const supabaseClient = useSupabaseClient();
  const [emailListData, setEmailListData] = useState<EmailListData>([]);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [pendingInviteList, setPendingInviteList] = useState<PendingInvite[]>(
    []
  );
  const [isResendingInvite, setIsResendingInvite] = useState(false);

  const handleInvite = async () => {
    try {
      if (!teamMember) return;
      setIsInvitingMember(true);

      await createTeamInvitation(supabaseClient, {
        emailList,
        teamMemberId: teamMember.team_member_id,
        teamName: team.team_name,
      });

      sendEmailInvite(emailList);

      setEmailList([]);
      notifications.show({
        message: "Team member/s invited.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsInvitingMember(false);
    }
  };

  // send email invite to unregistered users
  const sendEmailInvite = async (emailList: string[]) => {
    const subject = `You have been invited to join ${team.team_name} on Formsly.`;
    const html = `<p>Hi,</p>
    <p>Please click the link below to accept the invitation.</p>
    &nbsp;
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/sign-up">${process.env.NEXT_PUBLIC_SITE_URL}/sign-up</a></p>
    &nbsp;
    <p>Thank you,</p>
    <p>Formsly Team</p>`;

    for (const email of emailList) {
      const isEmailExists = await checkIfEmailExists(supabaseClient, {
        email: email,
      });
      if (!isEmailExists) {
        try {
          const response = await axios.post("/api/send-email", {
            to: email,
            subject,
            html,
          });
          return response.data;
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      setIsResendingInvite(true);
      await sendEmailInvite([email]);
      setPendingInviteList((prev) =>
        prev.map((pendingInvite) => {
          if (pendingInvite.invitation_to_email === email) {
            return {
              ...pendingInvite,
              is_resend_disabled: true,
            };
          } else {
            return pendingInvite;
          }
        })
      );
      notifications.show({
        message: "Invitation sent",
        color: "green",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsResendingInvite(false);
    }
  };

  useEffect(() => {
    const fetchPendingTeamInvite = async () => {
      const { data } = await getTeamInvitation(supabaseClient, {
        teamId: team.team_id,
        status: "PENDING",
      });
      setPendingInviteList(data as PendingInvite[]);
    };

    fetchPendingTeamInvite();
  }, []);

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isInvitingMember}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Paper p="lg" shadow="xs">
        <Stack spacing={12}>
          <Text weight={600}>Invite Member</Text>

          <Divider mt={-12} />

          <Text size={14} mb={12}>
            Invite will be sent via email. If the user is already registered,
            they will receive a notification within the app.
          </Text>

          <Flex direction={{ base: "column", sm: "row" }} gap={12}>
            <MultiSelect
              data={emailListData}
              placeholder="juandelacruz@email.ph"
              searchable
              creatable
              clearable
              clearSearchOnChange
              onChange={setEmailList}
              getCreateLabel={(query) => (
                <Flex align="center" gap={4}>
                  <IconMailPlus size={14} />
                  <Text>{query}</Text>
                </Flex>
              )}
              shouldCreate={(query: string) => {
                const isEmail = validator.isEmail(query);
                const isAddedAlready = emailListData
                  .map((email) => email.value)
                  .includes(query);
                return isEmail && !isAddedAlready;
              }}
              onCreate={(query) => {
                let valid = true;
                const isMemberAlready = memberEmailList.includes(query);
                if (isMemberAlready) {
                  notifications.show({
                    message: "A member with this email already exists.",
                    color: "orange",
                  });
                  valid = false;
                }

                if (valid) {
                  const item = { value: query, label: query };
                  setEmailListData((current) => [...current, item]);
                  return item;
                }
              }}
              w="100%"
            />

            <Button
              onClick={() => {
                handleInvite();
                setEmailListData([]);
              }}
              leftIcon={<IconUsersPlus size={14} />}
              disabled={emailList.length <= 0}
            >
              Invite
            </Button>
          </Flex>
        </Stack>

        <Box mt="lg">
          <Text weight={600}>Pending Invites</Text>
          <Stack mt="sm" fz={14} spacing="xs" pos="relative">
            <LoadingOverlay visible={isResendingInvite} />
            {pendingInviteList.map((invite) => {
              const isResendDisabled = invite.is_resend_disabled;
              return (
                <Box key={invite.invitation_id}>
                  <Divider />
                  <Flex px="sm" mt="sm" justify="space-between" align="center">
                    <Text>{invite.invitation_to_email}</Text>

                    <Group position="right">
                      <Button variant="subtle">Cancel</Button>
                      <Button
                        miw={84}
                        onClick={() =>
                          handleResendInvite(invite.invitation_to_email)
                        }
                        disabled={isResendDisabled}
                      >
                        {isResendDisabled ? "Sent" : "Resend"}
                      </Button>
                    </Group>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default InviteMember;
