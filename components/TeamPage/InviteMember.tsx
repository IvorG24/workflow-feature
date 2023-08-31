import { getTeamInvitation } from "@/backend/api/get";
import { cancelTeamInvitation, createTeamInvitation } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { TeamMemberType } from "@/utils/types";
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
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconMailPlus, IconUsersPlus } from "@tabler/icons-react";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import validator from "validator";

type Props = {
  memberEmailList: string[];
  isOwnerOrAdmin: boolean;
  teamMemberList: TeamMemberType[];
};

type EmailListData = { value: string; label: string }[];

type PendingInvite = {
  invitation_id: string;
  invitation_to_email: string;
  invitation_date_created: string;
  team_member: {
    team_member_team_id: string;
  };
};

type ResendInviteTimeout = {
  invitation_email: string;
  invitation_resend_date_created: Date;
}[];

const InviteMember = ({
  memberEmailList,
  isOwnerOrAdmin,
  teamMemberList,
}: Props) => {
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
  const [resendInviteTimeout, setResendInviteTimeout] =
    useLocalStorage<ResendInviteTimeout>({
      key: "formsly-resend-invite-timeout",
      defaultValue: [],
    });

  const handleInvite = async () => {
    try {
      if (!teamMember) return;
      setIsInvitingMember(true);

      await createTeamInvitation(supabaseClient, {
        emailList,
        teamMemberId: teamMember.team_member_id,
        teamName: team.team_name,
      });

      await sendEmailInvite(emailList);
      await fetchPendingInviteList();
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

  // send email invite notification
  const sendEmailInvite = async (emailList: string[]) => {
    const subject = `You have been invited to join ${team.team_name} on Formsly.`;
    const html = `<p>Hi,</p>
    <p>Please click the link below to accept the invitation.</p>
    &nbsp;
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/sign-in">${process.env.NEXT_PUBLIC_SITE_URL}/sign-in</a></p>
    &nbsp;
    <p>Thank you,</p>
    <p>Formsly Team</p>`;

    for (const email of emailList) {
      try {
        const response = await axios.post("/api/send-email", {
          to: email,
          subject,
          html,
        });
        return response.data;
      } catch (error) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      setIsResendingInvite(true);
      await sendEmailInvite([email]);
      const dateNow = new Date();
      const resendInviteWithDateCreated = {
        invitation_email: email,
        invitation_resend_date_created: dateNow,
      };
      setResendInviteTimeout((prev) => {
        const isExisting = prev.find(
          (invite) => invite.invitation_email === email
        );
        if (!isExisting) {
          prev.push(resendInviteWithDateCreated);
        }
        return prev;
      });
      notifications.show({
        message: "Invitation resent",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsResendingInvite(false);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    try {
      await cancelTeamInvitation(supabaseClient, {
        invitation_id: invitationId,
      });
      setPendingInviteList((prev) =>
        prev.filter((invite) => invite.invitation_id !== invitationId)
      );
      notifications.show({
        message: "Invitation canceled",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const fetchPendingInviteList = async () => {
    const { data } = await getTeamInvitation(supabaseClient, {
      teamId: team.team_id,
      status: "PENDING",
    });
    setPendingInviteList(data as PendingInvite[]);
  };

  useEffect(() => {
    fetchPendingInviteList();
  }, []);

  useEffect(() => {
    const teamMemberIdList = teamMemberList
      .map((member) => member.team_member_id)
      .join(", ");

    const channel = supabaseClient
      .channel("realtime-team-invitation")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitation_table",
          filter: `invitation_from_team_member_id=in.(${teamMemberIdList})`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const isInviteAccepted = payload.new.invitation_status;
            const isInviteDisabled = payload.new.invitation_is_disabled;

            if (isInviteAccepted || isInviteDisabled) {
              const removeInviteFromPendingList = pendingInviteList.filter(
                (invite) => invite.invitation_id !== payload.new.invitation_id
              );

              setPendingInviteList(removeInviteFromPendingList);
            }
          }

          if (payload.eventType === "INSERT") {
            fetchPendingInviteList();
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, team.team_id, teamMemberList, pendingInviteList]);

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
                if (emailListData.length > 60) {
                  notifications.show({
                    message: "You have exceeded the invite limit of 60.",
                    color: "orange",
                  });
                  valid = false;
                }

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
          <Text
            weight={600}
          >{`Pending Invites (${pendingInviteList.length})`}</Text>
          {pendingInviteList.length > 0 && (
            <Stack mt="sm" fz={14} spacing="xs" pos="relative">
              <LoadingOverlay visible={isResendingInvite} />
              {pendingInviteList.map((invite) => {
                const resendDateCreated =
                  resendInviteTimeout.find(
                    (resendInvite) =>
                      resendInvite.invitation_email ===
                      invite.invitation_to_email
                  )?.invitation_resend_date_created || null;
                const dateNow = new Date();
                const isResendDisabled = resendDateCreated
                  ? !(moment(dateNow).diff(resendDateCreated, "minutes") > 1)
                  : false;

                return (
                  <Box key={invite.invitation_id}>
                    <Divider />
                    <Flex
                      px="sm"
                      mt="sm"
                      justify="space-between"
                      align="center"
                    >
                      <Text>{invite.invitation_to_email}</Text>

                      {isOwnerOrAdmin && (
                        <Group position="right">
                          <Button
                            variant="subtle"
                            onClick={() =>
                              handleCancelInvite(invite.invitation_id)
                            }
                          >
                            Cancel
                          </Button>
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
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default InviteMember;
