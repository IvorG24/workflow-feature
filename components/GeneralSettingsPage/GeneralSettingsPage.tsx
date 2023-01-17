import { getFileUrl, uploadFile } from "@/utils/file";
import { deleteTeam, getTeamByTeamName, updateTeam } from "@/utils/queries-new";
import { Database, TeamTableRow } from "@/utils/types";
import {
  Avatar,
  Button,
  Container,
  Divider,
  FileInput,
  Flex,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

type Props = {
  team: TeamTableRow;
};

const GeneralSettingsPage = ({ team }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const logoInput = useRef<HTMLButtonElement>(null);
  const [teamName, setTeamName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [teamNameError, setTeamNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("");

  useEffect(() => {
    if (!team?.team_logo_filepath) return;
    const fetchCurrentLogoUrl = async () => {
      const url = await getFileUrl(
        supabase,
        `${team.team_logo_filepath}`,
        "team_logos"
      );
      setCurrentLogo(url);
    };
    fetchCurrentLogoUrl();
  }, []);

  const handleTeamName = async (value: string) => {
    setTeamNameError("");
    setIsChecking(true);
    setTeamName(value);
    if (value.length < 3 && value.length > 0) {
      setTeamNameError("Team name must be greater than 3 characters");
    } else if (value.length > 254) {
      setTeamNameError("Team name must be less than 254 characters");
    }

    getTeamByTeamName(supabase, value).then((team) => {
      const isTeamNameTaken = !!team;
      if (isTeamNameTaken) {
        setTeamNameError(`${value} team name is already taken`);
      }
      setIsChecking(false);
    });
  };

  const handleUpdateTeam = async () => {
    if (teamNameError) return;
    if (!teamName && !teamLogo) return;

    try {
      setIsLoading(true);

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

      await updateTeam(supabase, {
        team_id: `${router.query.tid}`,
        team_name: teamName ? teamName.toLowerCase() : team.team_name,
        team_logo_filepath: filepath,
      });
      router.reload();
    } catch (e) {
      console.error(e);

      showNotification({
        title: "Error!",
        message: "Failed to Create Team",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDeleteTeam = async () => {
    setIsLoading(true);
    try {
      await deleteTeam(supabase, `${router.query.tid}`);
      router.push("/");
    } catch (e) {
      console.error(e);

      showNotification({
        title: "Error!",
        message: "Failed to Delete Team",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const openDeleteModal = () =>
    openConfirmModal({
      title: "Delete your team",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete your team? This action is destructive
          and you will have to contact support to restore your data.
        </Text>
      ),
      labels: { confirm: "Delete team", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onConfirm: handleDeleteTeam,
    });

  return (
    <Container fluid m={0} p={0}>
      <LoadingOverlay visible={isLoading} />
      <Title order={3}>Team Name</Title>
      <TextInput
        placeholder={`${team.team_name}`}
        mt="md"
        maw={350}
        onChange={(e) => handleTeamName(e.target.value)}
        rightSection={isChecking && <Loader size="xs" />}
        value={teamName}
        error={teamNameError}
        data-cy="team-name"
      />
      <Text mt="xs">You can use the name of your company or your team.</Text>
      <Title order={3} mt="xl">
        Icon
      </Title>
      <Flex mt="md" gap="xl" maw={350}>
        <Stack>
          <FileInput
            accept="image/png,image/jpeg"
            display="none"
            ref={logoInput}
            onChange={(e) => setTeamLogo(e)}
          />
          <Avatar
            size={100}
            radius={100}
            src={teamLogo ? URL.createObjectURL(teamLogo) : currentLogo}
            alt="Team Logo"
            color="green"
          >
            {upperCase(team.team_name?.slice(0, 2))}
          </Avatar>
        </Stack>
        <Stack>
          <Text>We recommend an image of at least 512 x 512.</Text>
          <Button variant="outline" onClick={() => logoInput.current?.click()}>
            Upload Image
          </Button>
        </Stack>
      </Flex>
      <Button mt={40} onClick={handleUpdateTeam}>
        Update Team
      </Button>
      <Divider my="xl" />
      <Title order={3}>Danger Zone</Title>
      <Text mt="xs">
        This will remove all data related to the team including requests and
        forms.
      </Text>
      <Button color="red" mt="xs" variant="outline" onClick={openDeleteModal}>
        Delete Team
      </Button>
    </Container>
  );
};

export default GeneralSettingsPage;
