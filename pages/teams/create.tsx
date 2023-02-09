import { CreateTeam, createTeam, isTeamNameExisting } from "@/utils/queries";
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
import { toUpper } from "lodash";
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
    if (!user?.id) router.push("/sign-in");
  }, [user, router.isReady]);

  const handleCreateTeam = async (userId: string, teamName: string) => {
    try {
      setIsCreatingTeam(true);
      if (!userId) {
        showNotification({
          title: "Error",
          message: "Please sign in to create a team.",
          color: "red",
        });
        return;
      }
      if (!teamName) {
        showNotification({
          title: "Error",
          message: "Please input a team name.",
          color: "red",
        });
        return;
      }

      // Check if team name already exists in database
      if (await isTeamNameExisting(supabaseClient, teamName)) {
        showNotification({
          title: "Error",
          message: "Team name already exists. Please try another name.",
          color: "red",
        });
        return;
      }

      const data = await createTeam(
        supabaseClient,
        {
          team_name: teamName,
        },
        userId
      );

      setCreatedTeam(data);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
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
                onClick={() => handleCreateTeam(user?.id || "", teamName)}
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
