import { createTeam, createTeamMember, uploadImage } from "@/backend/api/post";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserProfile } from "@/stores/useUserStore";
import { TeamMemberTableRow, TeamTableRow } from "@/utils/types";
import {
  Button,
  FileInput,
  Flex,
  LoadingOverlay,
  Paper,
  Stack,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconArrowLeft, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

type CreateFormProps = {
  changeStep: Dispatch<SetStateAction<number>>;
  setNewTeam: Dispatch<SetStateAction<TeamTableRow | null>>;
  setOwnerData: Dispatch<SetStateAction<TeamMemberTableRow | null>>;
};

type FormValues = {
  teamName: string;
  teamLogo: File | null;
};

const isValidImage = (mimeType: string) => {
  return (
    (validator.isMimeType("image/jpeg") || validator.isMimeType("image/png")) &&
    mimeType.startsWith("image/")
  );
};

const CreateTeamForm = ({
  changeStep,
  setNewTeam,
  setOwnerData,
}: CreateFormProps) => {
  const user = useUserProfile();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { setTeamList } = useTeamActions();
  const teamList = useTeamList();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const handleCreateTeam = async (data: FormValues) => {
    try {
      setIsCreatingTeam(true);
      if (!user) {
        return notifications.show({
          title: "Invalid user.",
          message: "Please login and try again.",
          color: "red",
        });
      }
      const teamId = uuidv4();

      let imageUrl = "";
      if (data.teamLogo) {
        imageUrl = await uploadImage(supabaseClient, {
          id: teamId,
          image: data.teamLogo,
          bucket: "TEAM_LOGOS",
        });
      }

      const teamData = await createTeam(supabaseClient, {
        team_id: teamId,
        team_name: data.teamName,
        team_user_id: user.user_id,
        team_logo: imageUrl,
      });

      const ownerData = (
        await createTeamMember(supabaseClient, {
          team_member_team_id: teamData.team_id,
          team_member_user_id: user.user_id,
          team_member_role: "OWNER",
        })
      )[0];

      if (teamData && ownerData) {
        const updatedTeamList = [...teamList, teamData];
        setNewTeam(teamData);
        setOwnerData(ownerData);
        setTeamList(updatedTeamList);
        changeStep((prev) => prev + 1);
      }
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please reload the page and try again.",
        color: "red",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };
  return (
    <Paper p="xl" mt="xl">
      <form onSubmit={handleSubmit(handleCreateTeam)}>
        {" "}
        <LoadingOverlay visible={isCreatingTeam} overlayBlur={2} />
        <Stack spacing="lg">
          <Title order={4}>Enter team details</Title>
          <TextInput
            label="Team Name"
            withAsterisk
            {...register("teamName", { required: true })}
            error={errors.teamName?.message}
          />

          <Controller
            control={control}
            name="teamLogo"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileInput
                label="Team Logo"
                description="Only JPEG and PNG images are allowed."
                placeholder="Upload team logo"
                value={value}
                onChange={(value) => onChange(value)}
                error={error?.message}
                icon={<IconUpload size={rem(14)} />}
                accept="image/png,image/jpeg"
                clearable
              />
            )}
            rules={{
              validate: (v) => {
                if (!v) {
                  return true;
                }
                return (
                  isValidImage(v?.type || "") ||
                  "Image is invalid. Please use jpeg and png images only."
                );
              },
            }}
          />
          <Flex gap="md" wrap="wrap">
            <Button
              sx={{ flex: 1 }}
              size="md"
              variant="outline"
              leftIcon={<IconArrowLeft size={rem(14)} />}
              type="button"
              onClick={() => router.back()}
            >
              Go back
            </Button>
            <Button sx={{ flex: 1 }} size="md" type="submit">
              Create Team
            </Button>
          </Flex>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateTeamForm;
