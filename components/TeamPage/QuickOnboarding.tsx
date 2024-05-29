import { checkIfEmailsOnboarded } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  List,
  LoadingOverlay,
  MultiSelect,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconMailPlus, IconUsersPlus } from "@tabler/icons-react";
import { useState } from "react";
import validator from "validator";

type Props = {
  memberEmailList: string[];
};

type EmailListData = { value: string; label: string }[];

const QuickOnboarding = ({ memberEmailList }: Props) => {
  const team = useActiveTeam();
  const teamMember = useUserTeamMember();
  const supabaseClient = useSupabaseClient();
  const [emailListData, setEmailListData] = useState<EmailListData>([]);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);

  const handleInvite = async () => {
    try {
      if (!teamMember) return;
      setIsInvitingMember(true);

      const emailOnboardList = await checkIfEmailsOnboarded(supabaseClient, {
        emailList,
      });
      const onboardedList = emailOnboardList.filter((email) => email.onboarded);
      const emailToInvite = emailOnboardList
        .filter((email) => !email.onboarded)
        .map((email) => email.email);

      if (onboardedList.length > 0) {
        notifications.show({
          title: "Warning: Email(s) Skipped",
          autoClose: false,
          message: (
            <Box>
              <Text>
                The following email(s) have been skipped as they are already
                onboarded. Please use the Invite Member feature instead.
              </Text>
              <List color="dimmed" size="xs">
                {onboardedList.map((onboarded) => (
                  <List.Item key={onboarded.email}>{onboarded.email}</List.Item>
                ))}
              </List>
            </Box>
          ),
          color: "yellow",
        });
      }

      if (emailToInvite.length <= 0) return;
      await sendEmailTeamInvite({
        emailList: emailToInvite,
        teamId: team.team_id,
        teamName: team.team_name,
      });

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
  const sendEmailTeamInvite = async ({
    emailList,
    teamName,
    teamId,
  }: {
    emailList: string[];
    teamId: string;
    teamName: string;
  }) => {
    const response = await fetch("/api/quick-onboard/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailList,
        teamName,
        teamId,
      }),
    });

    const responseData = await response.json();
    return responseData;
  };

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isInvitingMember}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Paper p="lg" shadow="xs">
        <Stack spacing={12}>
          <Text weight={600}>Quick Onboarding</Text>

          <Divider mt={-12} />

          <Text size={14} mb={12}>
            An invitation will be sent via email to unregistered addresses only.
            Upon creating their password, users will be seamlessly added to the
            team.
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
      </Paper>
    </Container>
  );
};

export default QuickOnboarding;
