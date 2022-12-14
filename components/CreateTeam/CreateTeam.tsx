import { Database } from "@/utils/database.types";
import { createTeamInvitation, createUserTeam } from "@/utils/queries";
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
  const [teamLogo, setTeamLogo] = useState<Blob | MediaSource | null>(null);
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

  const handleCreateTeam = async (action: "skip" | "invite") => {
    setIsCreating(true);
    // todo team logo bucket
    try {
      const team = await createUserTeam(supabase, `${user?.id}`, teamName, "");
      if (action === "invite" && members.length > 0) {
        await createTeamInvitation(
          supabase,
          team.team_id,
          `${user?.id}`,
          members
        );
      }
      router.push(`/t/${team.team_id}/dashboard`);
    } catch {
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
        <Stepper active={active} onStepClick={setActive} orientation="vertical">
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
