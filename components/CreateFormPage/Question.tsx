// todo: create unit test
import {
  Button,
  Container,
  Flex,
  Paper,
  Radio,
  Tabs,
  TextInput,
} from "@mantine/core";
import { DateRangePicker } from "@mantine/dates";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FormBuilder from "./FormBuilder";
import { FormRequestData } from "./type";

const Question = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormRequestData>();
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
            <Paper shadow="sm" p="lg" withBorder mt="sm">
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
                <Controller
                  rules={{
                    required: "Review Period is required",
                  }}
                  control={control}
                  name="review_period"
                  render={({ field: { name, onChange, ref } }) => (
                    <DateRangePicker
                      mt="lg"
                      name={name}
                      onChange={onChange}
                      ref={ref}
                      label="Review Period"
                      withAsterisk
                      error={errors.review_period?.message}
                    />
                  )}
                />
              </Flex>
            </Paper>
            <FormBuilder control={control} register={register} />
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="xs">
            <Paper shadow="sm" p="lg" withBorder mt="md">
              <Radio.Group
                size="lg"
                label="Review period"
                error={errors.review_period?.message}
              >
                <Flex direction="column" gap="sm" mt="sm">
                  <Radio
                    size="sm"
                    value="approval_form"
                    label="Approval Form"
                    {...register("review_period")}
                  />
                  <Radio
                    size="sm"
                    value="review_form"
                    label="Review Form"
                    {...register("review_period")}
                  />
                </Flex>
              </Radio.Group>

              <Radio.Group label="Set as default for" mt="lg" size="lg">
                <Flex direction="column" gap="sm" mt="xs">
                  <Radio
                    size="sm"
                    value="none"
                    label="None"
                    {...register("default")}
                  />
                  <Radio
                    size="sm"
                    value="peer_review"
                    label="Peer Review"
                    {...register("default")}
                  />
                  <Radio
                    size="sm"
                    value="employee_review"
                    label="Employee Review"
                    {...register("default")}
                  />
                </Flex>
              </Radio.Group>
            </Paper>
          </Tabs.Panel>
          <Button type="submit" fullWidth mt="lg">
            Save
          </Button>
        </form>
      </Tabs>
    </Container>
  );
};

export default Question;
