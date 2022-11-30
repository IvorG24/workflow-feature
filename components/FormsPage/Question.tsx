import {
  Button,
  Container,
  Group,
  Paper,
  Tabs,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AddCircle } from "../Icon";

type Data = {
  title: string;
  description: string;
  approver: string;
};

const Question = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const [activeTab, setActiveTab] = useState<string | null>("question");

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
  });

  return (
    <Container size="lg" p="md" maw={500}>
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="question">Question</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="question" pt="xs">
          <Paper shadow="sm" p="lg" withBorder>
            <Group>
              <form onSubmit={onSubmit}>
                <TextInput
                  label="Title"
                  withAsterisk
                  {...register("title", { required: "Title is required" })}
                  error={errors.title?.message}
                />
                <TextInput
                  label="Description"
                  {...register("description")}
                  mt="lg"
                />
                <Button
                  variant="subtle"
                  leftIcon={<AddCircle />}
                  my="lg"
                  aria-label="Add default approvers"
                >
                  Add Default Approvers
                </Button>
              </form>
            </Group>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xs">
          <Paper shadow="sm" p="lg" withBorder>
            Settings tab content
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Question;
