import { isValidTeamName } from "@/utils/string";
import { TeamTableRow } from "@/utils/types";
import {
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { upperCase } from "lodash";
import { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import UploadAvatar from "../UploadAvatar/UploadAvatar";
import { UpdateTeamInfoForm } from "./TeamPage";

type Props = {
  team: TeamTableRow;
  isUpdatingTeam: boolean;
  onUpdateTeam: (data: UpdateTeamInfoForm) => void;
  teamLogoFile: File | null;
  onTeamLogoFileChange: Dispatch<SetStateAction<File | null>>;
  isOwnerOrAdmin: boolean;
};

const TeamInfoForm = ({
  team,
  isUpdatingTeam,
  onUpdateTeam,
  teamLogoFile,
  onTeamLogoFileChange,
  isOwnerOrAdmin,
}: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isDirty },
  } = useFormContext<UpdateTeamInfoForm>();

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isUpdatingTeam}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Paper p="lg" shadow="xs">
        <form onSubmit={handleSubmit(onUpdateTeam)}>
          <Stack spacing={12}>
            <Text weight={600}>Team Info</Text>

            <Divider mt={-12} />

            <Group mt="md" pl="md">
              <UploadAvatar
                src={getValues("teamLogo")}
                value={teamLogoFile}
                onChange={onTeamLogoFileChange}
                onError={(error: string) =>
                  setError("teamLogo", { message: error })
                }
                initials={upperCase(`${team.team_name[0]}${team.team_name[1]}`)}
                id={team.team_id}
                disabled={!isOwnerOrAdmin}
              />
            </Group>

            <TextInput
              mt="md"
              {...register("teamName", {
                required: true,
                minLength: 2,
                maxLength: 50,
                validate: {
                  isValid: (value: string) =>
                    isValidTeamName(value) || "Invalid team name.",
                },
              })}
              placeholder="Team name"
              w="100%"
              error={errors.teamName?.message}
              label={`Team Name`}
              description={
                <Text size="xs" fw="light" w="100%">
                  Team name must be maximum of 50 characters long and can only
                  contain letters (both uppercase and lowercase), digits,
                  underscores, dots, spaces, and hyphens. No other special
                  characters are allowed. Example team names:
                  &quot;Team_ABC&quot;, &quot;Red_Sox&quot;, &quot;ACME
                  Inc.&quot;, &quot;The New Team 2023&quot;.
                </Text>
              }
              readOnly={!isOwnerOrAdmin}
              variant={isOwnerOrAdmin ? "default" : "filled"}
            />

            {isOwnerOrAdmin && (
              <Button
                type="submit"
                sx={{ alignSelf: "flex-end" }}
                disabled={!isDirty && teamLogoFile === null}
              >
                Save Changes
              </Button>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default TeamInfoForm;
