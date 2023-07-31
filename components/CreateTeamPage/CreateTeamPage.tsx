import { useActiveTeam } from "@/stores/useTeamStore";
import { TeamMemberTableRow, TeamTableRow } from "@/utils/types";
import { Container, Stepper, Text, Title } from "@mantine/core";
import { isEmpty } from "lodash";
import { useState } from "react";
import CreateTeamForm from "./CreateTeamForm";
import InviteForm from "./InviteForm";
import TeamCard from "./TeamCard";

const CreateTeamPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [newTeam, setNewTeam] = useState<TeamTableRow | null>(null);
  const [ownerData, setOwnerData] = useState<TeamMemberTableRow | null>(null);

  const activeTeam = useActiveTeam();

  const renderSteps = (activeStep: number) => {
    switch (activeStep) {
      case 1:
        return (
          <CreateTeamForm
            changeStep={setActiveStep}
            setNewTeam={setNewTeam}
            setOwnerData={setOwnerData}
          />
        );

      case 2:
        return (
          <InviteForm
            changeStep={setActiveStep}
            ownerData={ownerData as TeamMemberTableRow}
            teamName={newTeam?.team_name}
          />
        );

      case 3:
        return <TeamCard team={newTeam as TeamTableRow} />;

      default:
        break;
    }
  };

  return (
    <Container>
      <Title>Create Team </Title>
      {isEmpty(activeTeam) ? (
        <Text color="dimmed">
          or wait for a team invitation that will show up in your notification.
        </Text>
      ) : null}
      <Stepper my="xl" iconSize={42} active={activeStep} breakpoint="sm">
        <Stepper.Step label="Step 1" description="Create team" />
        <Stepper.Step label="Step 2" description="Invite members" />
        <Stepper.Step label="Step 3" description="Go to team" />
      </Stepper>
      {renderSteps(activeStep)}
    </Container>
  );
};

export default CreateTeamPage;
