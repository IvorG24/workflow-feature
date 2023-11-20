import { useActiveTeam } from "@/stores/useTeamStore";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

const LeaveTeamSection = () => {
  // const supabaseClient = createPagesBrowserClient<Database>();
  // const router = useRouter();
  const activeTeam = useActiveTeam();
  // const authUserMember = useUserTeamMember();
  // const authUserTeamList = useTeamList();
  // const { setTeamList } = useTeamActions();
  const [openFirstWarningModal, setOpenFirstWarningModal] = useState(false);
  const [openLeaveTeamFormModal, setOpenLeaveTeamFormModal] = useState(false);
  const [checkedLeave, setCheckedLeave] = useState(false);

  const handleOpenLeaveTeamFormModal = () => {
    setOpenFirstWarningModal(false);
    setOpenLeaveTeamFormModal(true);
  };

  const onLeaveTeam = async () => {
    try {
      // const teamId = activeTeam.team_id;
      // const updatedTeamList = authUserTeamList.filter(
      //   (team) => team.team_id !== teamId
      // );
      // setTeamList(updatedTeamList);
      // setTimeout(router.reload, 500);
      // if (updatedTeamList.length <= 0) {
      //   router.push("/team/create");
      // }
    } catch (error) {
      notifications.show({
        message: "Error: cannot leave team",
        color: "red",
      });
    }
  };

  return (
    <Paper mt="xl" p="lg" shadow="xs">
      <Title order={3}>Leave Team</Title>

      <Card mt="md" withBorder radius="md">
        <Card.Section inheritPadding py="xs">
          <Group position="apart">
            <Text>
              If you go ahead, you&apos;ll lose access to everything in this
              team. Please proceed with caution.
            </Text>
            <Button color="red" onClick={() => setOpenFirstWarningModal(true)}>
              Leave Team
            </Button>
          </Group>
        </Card.Section>
      </Card>

      {/* FIRST WARNING MODAL */}
      <Modal
        centered
        opened={openFirstWarningModal}
        onClose={() => setOpenFirstWarningModal(false)}
        title={`Leave team ${activeTeam.team_name}`}
      >
        <Stack spacing="xl" py="xs">
          <Group position="center" spacing="xs">
            <Text>
              Leaving the team will revoke your access to team-specific forms
              and requests.
            </Text>
          </Group>
          <Divider />
          <Button variant="default" onClick={handleOpenLeaveTeamFormModal}>
            I want to leave this team
          </Button>
        </Stack>
      </Modal>

      {/* LEAVE TEAM FORM MODAL */}
      <Modal
        centered
        opened={openLeaveTeamFormModal}
        onClose={() => {
          setOpenLeaveTeamFormModal(false);
        }}
        title={`Leave team ${activeTeam.team_name}`}
      >
        <Text>
          Confirm your departure by drawing or uploading your signature.
        </Text>
        <Stack spacing="xl" py="xs">
          <Checkbox
            label="I have read and understand the effects of this action."
            checked={checkedLeave}
            onChange={(e) => setCheckedLeave(e.currentTarget.checked)}
            required
          />

          <Button color="red" onClick={onLeaveTeam} disabled={!checkedLeave}>
            Leave this team
          </Button>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default LeaveTeamSection;
