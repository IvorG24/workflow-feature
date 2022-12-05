// todo: create unit test
import {
  Button,
  Center,
  ColorSwatch,
  Container,
  Flex,
  Paper,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type Data = {
  teamName: string;
};

const CreateTeam = () => {
  const theme = useMantineTheme();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const { teamName } = router.query;

  const onSubmit = handleSubmit(async (data) => {
    router.push(`/teams/create?step=2&teamName=${data.teamName}`);
  });

  return (
    <Container p="md" maw={500}>
      <Paper shadow="sm" p="lg" withBorder mt="lg">
        <Title order={1} mb="xl">
          Create your Team
        </Title>
        <form onSubmit={onSubmit}>
          <TextInput
            placeholder="Team Name"
            {...register("teamName", { required: "Team name is required" })}
            value={teamName}
            error={errors.teamName?.message}
          />
          <Center mt="xl">
            <Button type="submit" mt="xl" aria-label="next">
              Next
            </Button>
          </Center>
        </form>
        <Flex justify="center" mt="xl" gap="xs">
          <ColorSwatch color={theme.colors["dark"][6]} size={12} />
          <ColorSwatch color={theme.colors["dark"][1]} size={12} />
        </Flex>
      </Paper>
    </Container>
  );
};

export default CreateTeam;
