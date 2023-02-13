import { CreateTeam, createTeam, isTeamNameExisting } from "@/utils/queries";
import { isValidTeamName } from "@/utils/string";
import {
  Button,
  Center,
  Flex,
  LoadingOverlay,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toLower, toUpper } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function CreateTeamPage() {
  const supabaseClient = useSupabaseClient();
  const [teamName, setTeamName] = useState("");
  const user = useUser();
  const router = useRouter();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [createdTeam, setCreatedTeam] = useState<CreateTeam | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!user?.id) router.push("/authentication");
  }, [user, router.isReady]);

  const handleCreateTeam = async (userId: string, teamName: string) => {
    try {
      setIsCreatingTeam(true);
      if (!userId) {
        showNotification({
          message: "Please sign in to create a team.",
          color: "red",
        });
        return;
      }
      if (!teamName) {
        showNotification({
          message: "Please input a team name.",
          color: "red",
        });
        return;
      }

      if (!isValidTeamName(teamName.trim())) {
        showNotification({
          message:
            "Team name must contain 6-30 alphanumeric characters and underscores, periods, apostrophes, or dashes only",
          color: "red",
        });
        return;
      }

      if (await isTeamNameExisting(supabaseClient, teamName)) {
        // Check if team name already exists in database
        showNotification({
          message: "Team name already exists. Please try another name.",
          color: "red",
        });
        return;
      }

      const data = await createTeam(
        supabaseClient,
        {
          team_name: teamName.toLowerCase().trim(),
          team_user_id: userId,
        },
        userId
      );

      setCreatedTeam(data);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  return (
    <>
      <Center h="90vh">
        <LoadingOverlay visible={isCreatingTeam} overlayBlur={2} />
        <Flex direction="column" gap="sm" w={400}>
          {!createdTeam && (
            <>
              <Text fz="xl" fw={700}>
                Create team
              </Text>
              <TextInput
                size="xl"
                placeholder="Input team name"
                value={toUpper(teamName)}
                onChange={(event) => setTeamName(event.currentTarget.value)}
              />
              <Button
                onClick={() =>
                  handleCreateTeam(user?.id || "", toLower(teamName.trim()))
                }
              >
                Continue
              </Button>
            </>
          )}
          {createdTeam && (
            <>
              <Text fz="xl" fw={700}>
                {`Team ${toUpper(
                  createdTeam.team_table.team_name as string
                )} created`}
              </Text>
              <Button
                onClick={() =>
                  router.push(`/teams/${createdTeam.team_table.team_name}`)
                }
              >
                Proceed to team page
              </Button>
            </>
          )}
        </Flex>
      </Center>
    </>
  );
}

export default CreateTeamPage;
