import { deleteTeam } from "@/backend/api/update";
import {
  useActiveTeam,
  useTeamActions,
  useTeamList,
} from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertCircle, IconUsersGroup } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  totalMembers: number;
};

type DeleteTeamFormInputs = {
  teamName: string;
  agreeCheckbox: boolean;
};

const DeleteTeamSection = ({ totalMembers }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const authUserMember = useUserTeamMember();
  const authUserTeamList = useTeamList();
  const { setTeamList } = useTeamActions();
  const [openFirstWarningModal, setOpenFirstWarningModal] = useState(false);
  const [openDeleteTeamFormModal, setOpenDeleteTeamFormModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteTeamFormInputs>();

  const handleOpenDeleteTeamFormModal = () => {
    setOpenFirstWarningModal(false);
    setOpenDeleteTeamFormModal(true);
  };

  const onDeleteTeam = async (data: DeleteTeamFormInputs) => {
    try {
      const teamId = activeTeam.team_id;

      if (!authUserMember || !data) return;

      await deleteTeam(supabaseClient, {
        teamId: teamId,
        teamMemberId: authUserMember.team_member_id,
      });
      reset();
      const updatedTeamList = authUserTeamList.filter(
        (team) => team.team_id !== teamId
      );
      setTeamList(updatedTeamList);

      setTimeout(router.reload, 500);

      if (updatedTeamList.length <= 0) {
        router.push("/team/create");
      }
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Error: can not delete team",
        color: "red",
      });
    }
  };

  return (
    <Paper mt="xl" p="lg" shadow="xs">
      <Title order={3}>Danger Zone</Title>

      <Card mt="md" withBorder radius="md">
        <Card.Section inheritPadding py="xs">
          <Group position="apart">
            <Text>
              Once deleted, the team cannot be recovered. Please proceed with
              caution.
            </Text>
            <Button color="red" onClick={() => setOpenFirstWarningModal(true)}>
              Delete Team
            </Button>
          </Group>
        </Card.Section>
      </Card>

      {/* FIRST WARNING MODAL */}
      <Modal
        centered
        opened={openFirstWarningModal}
        onClose={() => setOpenFirstWarningModal(false)}
        title={`Delete team ${activeTeam.team_name}`}
      >
        <Stack spacing="xl" py="xs">
          <Group position="center" spacing="xs">
            <Title order={3}>{activeTeam.team_name}</Title>
            <ActionIcon variant="transparent">
              <IconUsersGroup />
            </ActionIcon>
            <Text>{totalMembers} members</Text>
          </Group>
          <Divider />
          <Button variant="default" onClick={handleOpenDeleteTeamFormModal}>
            I want to delete this team
          </Button>
        </Stack>
      </Modal>

      {/* DELETE TEAM FORM MODAL */}
      <Modal
        centered
        opened={openDeleteTeamFormModal}
        onClose={() => {
          setOpenDeleteTeamFormModal(false);
          reset();
        }}
        title={`Delete team ${activeTeam.team_name}`}
      >
        <Stack spacing="xl" py="xs">
          <Group position="center" spacing="xs">
            <Title order={3}>{activeTeam.team_name}</Title>
            <ActionIcon variant="transparent">
              <IconUsersGroup />
            </ActionIcon>
            <Text>{totalMembers} members</Text>
          </Group>
          <Box>
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="yellow"
              variant="light"
            >
              This action is irreversible. Please be certain if you want to
              proceed.
            </Alert>
            <Box p="sm">
              <Text>
                This will permanently delete the team{" "}
                <strong>{activeTeam.team_name}</strong> along with its members,
                forms, and requests.
              </Text>
            </Box>

            <Divider />
          </Box>

          <form onSubmit={handleSubmit(onDeleteTeam)}>
            <Stack>
              <TextInput
                sx={{ userSelect: "none" }}
                label={`To confirm, type "${activeTeam.team_name.toLowerCase()}" (case-sensitive) in the box below.`}
                {...register("teamName", {
                  required: true,
                  validate: (value: string) =>
                    value === activeTeam.team_name.toLowerCase() ||
                    "Team name is incorrect",
                })}
                error={errors.teamName && errors.teamName.message}
                required
              />
              <Checkbox
                label="I have read and understand the effects of this action."
                {...register("agreeCheckbox", {
                  required: true,
                })}
                error={errors.agreeCheckbox && errors.agreeCheckbox.message}
                required
              />

              <Button mt="md" color="red" type="submit">
                Delete this team
              </Button>
            </Stack>
          </form>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default DeleteTeamSection;
