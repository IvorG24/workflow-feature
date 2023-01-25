// TODO: Refactor the frontend of this one.
import { Button, Container, Divider, Group, Paper, Text } from "@mantine/core";
import { useForm } from "@mantine/form";

function Onboarding() {
  const form = useForm();

  const handleSubmit = (values) => {
    console.log(values);
    // TODO: Save user profile information
    // TODO: Create first team

    

  };

  return (
    <Container p="xl" size="sm">
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Onboarding
        </Text>
        <Text size="md" weight={400}>
          Complete your profile information
        </Text>
        <Divider
          label="Add Profile Information"
          labelPosition="center"
          my="lg"
        />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group>
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              {...form.getInputProps("firstName")}
            />
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              {...form.getInputProps("lastName")}
            />
            <label>Username:</label>
            <input
              type="text"
              name="username"
              {...form.getInputProps("username")}
            />
            <label>Phone Number:</label>
            <input type="text" name="phone" {...form.getInputProps("phone")} />
            <label>Profile Picture:</label>
            <input
              type="file"
              name="avatar"
              {...form.getInputProps("avatar")}
            />
          </Group>
          <Divider
            label="Create your first team"
            labelPosition="center"
            my="lg"
          />
          <Group>
            <label>Team Name:</label>
            <input
              type="text"
              name="teamName"
              {...form.getInputProps("teamName")}
            />
            <label>Team Logo:</label>
            <input
              type="file"
              name="teamLogo"
              {...form.getInputProps("teamLogo")}
            />
          </Group>
          <Group position="center" mt="xl">
            <Button type="submit">Save</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default Onboarding;
