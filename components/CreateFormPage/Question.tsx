// todo: create unit test
import showNotification from "@/hooks/showNotifications";
import { Database } from "@/utils/database.types";
import {
  Button,
  Container,
  Flex,
  Paper,
  Radio,
  Tabs,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateRangePicker } from "@mantine/dates";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { alignQuestionOption } from "../CreateRequestFormPage/utils";
import FormBuilder from "./FormBuilder";
import { saveToFormTable } from "./saveToFormTable";
import { FormRequestData, Question, QuestionOption, QuestionRow } from "./type";

const Question = () => {
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormRequestData>();
  const [activeTab, setActiveTab] = useState<string | null>("question");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { description, questions, title } = data;
      const options = questions.map((item) => item.option);

      const formNameRecord = await supabase
        .from("form_name_table")
        .insert({ form_name: title })
        .select()
        .single();

      const questionRecord = await supabase
        .from("question_table")
        .insert([...(questions.map((item) => item.data) as Question[])])
        .select();

      const priority = questionRecord.data?.map(
        (item) => item.question_id
      ) as number[];

      const formNameId = formNameRecord.data?.form_name_id;

      await supabase
        .from("form_priority_table")
        .insert({ form_name_id: formNameId as number, priority });

      const userCreatedOption = alignQuestionOption(
        questionRecord.data as QuestionRow[],
        options as unknown as QuestionOption[][]
      );

      await supabase
        .from("user_created_select_option_table")
        .insert(userCreatedOption);

      const formTableRecord = saveToFormTable(
        formNameId || 0,
        priority,
        "3a820e69-8da1-4d80-98e2-5966fd2d663b",
        description,
        "af4e95a7-7198-440b-86cc-7127e6317408"
      );

      await supabase.from("form_table").insert(formTableRecord);
    } catch (e) {
      showNotification({
        message: "Error saving the form",
        state: "Danger",
        title: "Error",
      });
    }
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
                <Textarea
                  label="Description"
                  {...register("description")}
                  mt="lg"
                  minRows={3}
                />
                <Controller
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
