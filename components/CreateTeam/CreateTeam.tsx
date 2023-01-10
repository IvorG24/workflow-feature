import { Database } from "@/utils/database.types";
import { uploadFile } from "@/utils/file";
import {
  createNotification,
  createTeam,
  createTeamInvitation,
  getUserIdListFromEmailList,
} from "@/utils/queries-new";
import { NotificationTableInsert } from "@/utils/types-new";
import {
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Stepper,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";

const CreateTeam = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [teamNameError, setTeamNameError] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const logoInput = useRef<HTMLButtonElement>(null);

  const handleTeamName = (value: string) => {
    setTeamNameError("");
    setIsChecking(true);
    setTeamName(value);
    if (!value) {
      setTeamNameError("Team name is required");
    } else if (value.length < 3) {
      setTeamNameError("Team name must be greater than 3 characters");
    } else if (value.length > 254) {
      setTeamNameError("Team name must be less than 254 characters");
    }
    setTimeout(function () {
      setIsChecking(false);
    }, 1000);
  };

  // const handleUpload = (team: CreateUserTeam) => {
  //   return new Promise((resolve, reject) => {
  //     new Compressor(teamLogo as File, {
  //       quality: 0.6,
  //       async success(result) {
  //         resolve(await uploadTeamLogo(supabase, team.team_id, result));
  //       },
  //       error() {
  //         reject(
  //           showNotification({
  //             title: "Error!",
  //             message: "Failed to upload team icon",
  //             color: "red",
  //           })
  //         );
  //       },
  //     });
  //   });
  // };

  const handleCreateTeam = async (action: "skip" | "invite") => {
    try {
      setIsCreating(true);
      console.log(action);
      let filepath;
      // Call the uploadFile function first so that if the team logo upload fails, the team will not be created.
      if (teamLogo) {
        const { path } = await uploadFile(
          supabase,
          teamLogo.name,
          teamLogo,
          "team_logos"
        );
        filepath = path;
      }

      const createdTeam = await createTeam(supabase, user?.id as string, {
        team_name: teamName,
        team_logo_filepath: filepath,
      });

      if (action === "invite" && members.length > 0) {
        const teamInvitationList = await createTeamInvitation(
          supabase,
          createdTeam.team_id,
          `${user?.id}`,
          members
        );
        console.log(
          "🚀 ~ file: CreateTeam.tsx:106 ~ handleCreateTeam ~ teamInvitationList",
          teamInvitationList
        );

        // * Purpose: We remove emails of users that aren't registered yet to the app so we don't create in-app notification for them.
        const userIdWithEmailList = await getUserIdListFromEmailList(
          supabase,
          members
        );
        console.log(
          "🚀 ~ file: CreateTeam.tsx:112 ~ handleCreateTeam ~ userIdWithEmailList",
          userIdWithEmailList
        );

        if (!userIdWithEmailList) return;

        // Check if email is in userIdWithEmailList. e.g. userIdWithEmailList { userId: "123", userEmail: "dw@dwda.com" }
        const existingUserIdWithEmailList = userIdWithEmailList.filter(
          (userIdWithEmail) => {
            return members.includes(userIdWithEmail.userEmail);
          }
        );
        console.log(
          "🚀 ~ file: CreateTeam.tsx:121 ~ handleCreateTeam ~ existingUserIdWithEmailList",
          existingUserIdWithEmailList
        );

        // * Purpose: We create in-app notification for users that are registered in the app.
        // * Use createNotification() function to create notification for each user.
        // * Use Promise.all() to create notification for all users at the same time.

        const teamName = createdTeam.team_name;

        const promises = existingUserIdWithEmailList.map(
          ({ userId, userEmail }) => {
            // Get the created invitation from teamInvitationList that matches the userEmail.
            const teamInvitation = teamInvitationList.find(
              (teamInvitation) =>
                teamInvitation.invitation_target_email === userEmail
            );
            const notificationInsertInput: NotificationTableInsert = {
              notification_content: `${user?.email} has invited you to join their team ${teamName}.`,
              notification_redirect_url: `/team-invitations/${teamInvitation?.invitation_id}`,
            };

            return createNotification(
              supabase,
              userId,
              notificationInsertInput
            );
          }
        );

        await Promise.all(promises);
      }

      router.push(`/t/${createdTeam.team_id}/dashboard`);
    } catch (e) {
      console.error(e);
      setIsCreating(false);
      showNotification({
        title: "Error!",
        message: "Failed to Create Team",
        color: "red",
      });
    }
  };

  return (
    <Container m={0} px="xl" py="xl" fluid>
      <LoadingOverlay visible={isCreating} />
      <Title>Create Team</Title>
      <Flex wrap="wrap" align="stretch" justify="center" mt={50} gap={50}>
        <Stepper
          active={active}
          onStepClick={(value) => {
            if (!teamName) {
              handleTeamName(teamName);
            } else {
              setActive(value);
            }
          }}
          orientation="vertical"
        >
          <Stepper.Step
            label="Team Details"
            description="Insert team name and logo."
          />
          <Stepper.Step
            label="Team Members"
            description="Invite other users to become part of your team."
          />
        </Stepper>
        <Paper style={{ flex: 1 }} shadow="xl" radius="md" p="xl" withBorder>
          {active === 0 ? (
            <Step1
              isChecking={isChecking}
              teamName={teamName}
              handleTeamName={handleTeamName}
              teamNameError={teamNameError}
              setActive={setActive}
              logoInput={logoInput}
              teamLogo={teamLogo}
              setTeamLogo={setTeamLogo}
            />
          ) : null}
          {active === 1 ? (
            <Step2
              setActive={setActive}
              members={members}
              setMembers={setMembers}
              emailError={emailError}
              setEmailError={setEmailError}
              handleCreateTeam={handleCreateTeam}
            />
          ) : null}
        </Paper>
      </Flex>
    </Container>
  );
};

export default CreateTeam;
