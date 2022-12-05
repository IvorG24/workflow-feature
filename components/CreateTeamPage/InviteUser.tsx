// todo: create unit test
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
  const { teamName } = router.query;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();

  const onSubmit = handleSubmit(async (data) => {
    setInvited((prevEmails) => [...prevEmails, data.email]);
  });

  return (
    <Container p="md" maw={700}>
      <Paper shadow="sm" p="lg" withBorder mt="lg">
        <Flex>
          <UnstyledButton
            onClick={() =>
              router.push(`/teams/create?step=1&teamName=${teamName}`)
            }
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
                Invited People:
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
                onClick={() => router.push("/dashboard")}
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
