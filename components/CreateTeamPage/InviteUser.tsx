// todo: create unit test
import { Database } from "@/utils/database.types-new";
import {
  Button,
  Center,
  ColorSwatch,
  Container,
  Flex,
  Paper,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { ArrowBack } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import InvitedEmail from "./InvitedEmail";

type Data = {
  email: string;
};

const InviteUser = () => {
  const [invited, setInvited] = useState<string[]>([]);
  const theme = useMantineTheme();
  const router = useRouter();
  const { name } = router.query;
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Data>();

  const onSubmit = handleSubmit(async (data) => {
    setInvited((prevEmails) => [...prevEmails, data.email]);
    reset();
  });

  const handleCreateTeam = async () => {
    if (!user) throw new Error("User is not logged in");

    try {
      const { data, error } = await supabaseClient
        .from("team_table")
        .insert({ team_name: name as string, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      await router.push(
        `/t/${data.team_id as string}/requests?active_tab=all&page=1`
      );
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error!",
        message: "Failed to Create Team",
        color: "red",
      });
    }
  };

  return (
    <Container p="md" maw={700}>
      <Paper shadow="sm" p="lg" withBorder mt="lg">
        <Flex>
          <UnstyledButton
            onClick={() => router.push(`/teams/create?step=1&name=${name}`)}
          >
            <IconWrapper color="gray" fontSize={20} display="block">
              <ArrowBack />
            </IconWrapper>
          </UnstyledButton>

          <Container m={0} fluid>
            <Title order={1} mb="xl">
              Invite People to your Team
            </Title>

            <form onSubmit={onSubmit}>
              <Flex justify="flex-start" gap="sm">
                <TextInput
                  placeholder="e.g allisonhaynes@gmail.com"
                  {...register("email", {
                    required: "Email is required",
                    validate: {
                      isEmail: (input) =>
                        validator.isEmail(input) || "Email is invalid",
                    },
                  })}
                  error={errors.email?.message}
                  w={400}
                />
                <Button type="submit" aria-label="send invite">
                  Send Invite
                </Button>
              </Flex>
            </form>

            {invited.length > 0 && (
              <Text size="lg" color="dark" mt="xl">
                People Invited:
              </Text>
            )}
            {invited.map((email) => (
              <InvitedEmail
                key={email}
                email={email}
                onRemove={() =>
                  setInvited((emails) =>
                    emails.filter((value) => email !== value)
                  )
                }
              />
            ))}

            <Center>
              <Button
                type="submit"
                aria-label="create team"
                mt="xl"
                onClick={() => handleCreateTeam()}
              >
                Create Team
              </Button>
            </Center>

            <Flex justify="center" mt="xl" gap="xs">
              <ColorSwatch color={theme.colors["dark"][1]} size={12} />
              <ColorSwatch color={theme.colors["dark"][6]} size={12} />
            </Flex>
          </Container>
        </Flex>
      </Paper>
    </Container>
  );
};

export default InviteUser;
