import {
  Button,
  Container,
  Flex,
  Paper,
  Radio,
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
  review_period: string;
  default: string;
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

        <form onSubmit={onSubmit}>
          <Tabs.Panel value="question" pt="xs">
            <Paper shadow="sm" p="lg" withBorder>
              <Flex direction="column">
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
              </Flex>
              <Button
                variant="subtle"
                leftIcon={<AddCircle />}
                my="lg"
                aria-label="Add default approvers"
              >
                Add Default Approvers
              </Button>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="xs">
            <Paper shadow="sm" p="lg" withBorder>
              <Radio.Group
                label="Review period"
                error={errors.review_period?.message}
                mb="sm"
              >
                <Flex direction="column" gap="sm" mt="xs">
                  <Radio
                    value="approval_form"
                    label="Approval Form"
                    {...register("review_period")}
                  />
                  <Radio
                    value="review_form"
                    label="Review Form"
                    {...register("review_period")}
                  />
                </Flex>
              </Radio.Group>
              <Radio.Group label="Set as default for" mt="lg">
                <Flex direction="column" gap="sm" mt="xs">
                  <Radio value="none" label="None" {...register("default")} />
                  <Radio
                    value="peer_review"
                    label="Peer Review"
                    {...register("default")}
                  />
                  <Radio
                    value="employee_review"
                    label="Employee Review"
                    {...register("default")}
                  />
                </Flex>
              </Radio.Group>
            </Paper>
          </Tabs.Panel>
        </form>
      </Tabs>
    </Container>
  );
};

export default Question;
