import type { Database } from "@/utils/types";
import {
  FormInsert,
  FormNameRow,
  FormRow,
  QuestionRow,
  SelectOptionRow,
  TeamRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { useForm } from "react-hook-form";
import styles from "./CreateRequest.module.scss";

type FormData = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  description: string;
};

export type Form = (FormRow & { form_name: FormNameRow } & {
  question: QuestionRow;
} & { question_option: SelectOptionRow } & { team: TeamRow })[];

type Marks = {
  value: number;
  label: string;
};

const CreateRequest = () => {
  const MARKS: Marks[] = [
    {
      value: 1,
      label: "0%",
    },
    {
      value: 2,
      label: "25%",
    },
    {
      value: 3,
      label: "50%",
    },
    {
      value: 4,
      label: "75%",
    },
    {
      value: 5,
      label: "100%",
    },
  ];
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      behalf: "",
      description: "",
      requestor: "",
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  const [selectedApprover, setSelectedApprover] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [approvers, setApprovers] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formTemplate, setFormTemplate] = useState<Form>();
  const [answers, setAnswers] = useState<
    { questionId: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [selectOptionRowList, setSelectOptionRowList] =
  //   useState<SelectOptionRow[]>();

  useBeforeunload(() => {
    if (formTemplate && formTemplate[0].is_draft) {
      axios.post("/api/update", {
        formData: getValues(),
        approver: selectedApprover,
        answers: answers,
        requestId: formTemplate[0].request_id,
      });
    } else {
      axios.post("/api/insert", {
        formData: getValues(),
        isDraft: true,
        formId: router.query.formId,
        userId: user?.id,
        approver: selectedApprover,
        answers: answers,
      });
    }
  });

  const resetState = () => {
    reset();
    setFormName("");
    setApprovers([]);
    setFormTemplate(undefined);
    setAnswers([]);
  };

  useEffect(() => {
    if (!router.isReady) return;
    resetState();
    setIsLoading(true);
    // TODO add eq("team_id")
    const fetchApprovers = async () => {
      // todo: fetch from team_role
      const { data } = await supabase.from("user_profile_table").select("*");
      // TODO remove current user if the current user is a manager
      if (data) {
        const approvers = data.map((approver) => {
          return {
            label: `${approver.full_name}`,
            value: `${approver.user_id}`,
          };
        });
        if (approvers !== undefined) {
          const newApprovers = approvers.filter(
            (approver) => approver.value !== user?.id
          );
          setApprovers(newApprovers);
          setSelectedApprover(newApprovers[0].value);
        }
      }
    };

    const fetchForm = async () => {
      const { data: request_id } = await supabase
        .from("form_table")
        .select(`request_id`)
        .eq("form_name_id", router.query.formId)
        .eq("is_draft", true)
        .eq("response_owner", user?.id)
        .limit(1)
        .single();

      if (request_id) {
        fetchDraft(`${request_id.request_id}`);
      } else {
        handleFetchFormTemplate();
      }
    };

    const handleFetchFormTemplate = async () => {
      const { data, error } = await supabase
        .from("form_table")
        .select(
          `
            *,
            form_name:form_name_id(*),
            question:question_id(*),
            question_option:question_option_id(*),
            team:team_id(*)
          `
        )
        .eq("form_name_id", router.query.formId)
        .order("created_at", { ascending: true });

      // const { data: formPriority } = await supabase
      //   .from("form_priority_table")
      //   .select()
      //   .eq("form_name_id", router.query.formId)
      //   .limit(1)
      //   .single();

      if (error) {
        console.log(error);
        return;
      }
      if (!data) return;
      if (data.length === 0) return;

      // get only elements where request_id of first element is equal to other elements.
      const filteredForm = data.filter(
        (formRow) => formRow.request_id === data[0].request_id
      ) as Form;

      const formTemplate = handleClearResponseValues(filteredForm as Form);

      // TODO: Sort questions by form priority.
      // Sort questions by priority
      // const clearedForm = handleClearResponseValues(filteredForm as Form);
      // const formTemplate = clearedForm.sort(
      //   (a, b) =>
      //     formPriority.priority.indexOf(a.question_id) -
      //     formPriority.priority.indexOf(b.question_id)
      // );

      setAnswers(
        formTemplate.map((form) => {
          return { questionId: `${form.question_id}`, value: "" };
        })
      );
      setFormTemplate(formTemplate);
      setFormName(`${filteredForm[0].form_name.form_name}`);
    };

    const fetchDraft = async (request_id: string) => {
      const { data: requests } = await supabase
        .from("form_table")
        .select(
          `
            *,
            form_name:form_name_id(*),
            question:question_id(*),
            question_option:question_option_id(*),
            team:team_id(*)
          `
        )
        .eq("request_id", request_id)
        .eq("form_name_id", router.query.formId)
        .order("created_at", { ascending: true });

      const newRequest = requests as Form;

      console.log(JSON.stringify(requests, null, 2));

      if (!newRequest) return;
      setValue(
        "title",
        newRequest[0].request_title ? newRequest[0].request_title : ""
      );
      setValue(
        "description",
        newRequest[0].request_description
          ? newRequest[0].request_description
          : ""
      );
      setValue(
        "behalf",
        newRequest[0].on_behalf_of ? newRequest[0].on_behalf_of : ""
      );

      newRequest.shift();
      const draftAnswers = newRequest.map((request) => {
        return {
          questionId: `${request.question.question_id}`,
          value: `${request.response_value ? request.response_value[0] : ""}`,
        };
      });

      setAnswers(draftAnswers);
      setFormTemplate(newRequest);

      setSelectedApprover(`${requests && requests[0].approver_id}`);
      setFormName(`${newRequest[0].form_name.form_name}`);
    };

    const fetchCurrentUser = async () => {
      const { data } = await supabase
        .from("user_profile_table")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (data) {
        setValue("requestor", `${data.full_name}`);
      }
    };

    fetchApprovers();
    fetchForm();
    fetchCurrentUser();
    setIsLoading(false);
  }, [supabase, router, user]);

  const onSubmit = handleSubmit((fromData) =>
    formTemplate && formTemplate[0].is_draft
      ? handleUpdate(fromData)
      : handleSave(fromData, false)
  );

  const handleUpdate = async (formData: FormData) => {
    setIsCreating(true);
    try {
      // update each response value
      answers.map(async (answer) => {
        const { error } = await supabase
          .from("form_table")
          .update({
            is_draft: false,
            response_value: [answer.value],
          })
          .eq("question_id", answer.questionId)
          .eq("request_id", formTemplate && formTemplate[0].request_id);
        if (error) throw error;
      });

      await supabase
        .from("form_table")
        .update({
          request_title: formData.title,
          request_description: formData.description,
          on_behalf_of: formData.behalf,
          approver_id: selectedApprover,
          is_draft: false,
        })
        .eq("request_id", formTemplate && formTemplate[0].request_id);

      // const { error } = await supabase.from("form_table").insert(form);
      // if (error) throw error;
      showNotification({
        title: "Request sent for approval",
        message: "Kindly wait :)",
      });
      router.push("/requests");
    } catch (e) {
      console.error("Error saving the form", e);
      alert("Error saving the form");
    }
  };

  const handleSave = async (formData: FormData, isDraft: boolean) => {
    setIsCreating(true);

    const request = await supabase
      .from("request_table")
      .insert({})
      .select()
      .limit(1)
      .single();

    if (!request.data) throw new Error();

    const { error } = await supabase.from("form_table").insert({
      form_name_id: Number(`${router.query.formId}`),
      team_id: null,
      request_title: formData.title,
      request_description: formData.description,
      on_behalf_of: formData.behalf,
      approver_id: selectedApprover,
      approval_status: "pending",
      response_owner: user?.id,
      request_id: Number(`${request.data.request_id}`),
      is_draft: isDraft,
      form_owner: `${user?.id}`,
    });

    const questionIdList = answers.map((answer) => Number(answer.questionId));
    const answerList = answers.map((answer) => answer.value);
    const { data: options } = await supabase
      .from("user_created_select_option_table")
      .select("*");
    const optionIdList = options?.map((option) => option.question_id);
    const form: FormInsert[] = saveToFormTable(
      Number(`${router.query.formId}`),
      questionIdList,
      `${user?.id}`,
      Number(`${request.data?.request_id}`),
      formData.title,
      formData.description,
      `${selectedApprover}`,
      formData.behalf,
      answerList,
      isDraft,
      optionIdList
    );

    await supabase.from("form_table").insert(form);

    if (error) {
      showNotification({
        title: "Failed to Create Request!",
        message: error.message,
        color: "red",
      });
      setIsCreating(false);
    } else {
      if (isDraft) {
        showNotification({
          title: "Success!",
          message: "Draft Saved",
          color: "green",
        });
      } else {
        showNotification({
          title: "Success!",
          message: "Request Created",
          color: "green",
        });
      }
      router.push("/requests");
    }
  };

  const handleClearResponseValues = (form: Form) => {
    return form.map((formRow) => {
      return {
        ...formRow,
        response_value: [""],
        response_owner: "",
        response_comment: "",
      };
    });
  };

  const saveToFormTable = (
    form_name_id: number,
    questionIdList: number[],
    form_owner: string,
    request_id: number,
    title: string,
    description: string,
    approver: string,
    behalf: string,
    answerList: string[],
    isDraft: boolean,
    optionIdList: number[] | undefined
  ) => {
    const formTableRecord: FormInsert[] = [];

    for (let i = 0; i < questionIdList.length; i++) {
      const question_id = questionIdList[i];
      const answer = answerList[i];
      formTableRecord.push({
        question_id,
        request_id,
        form_name_id,
        form_owner,
        team_id: null,
        is_draft: isDraft,
        request_title: title,
        request_description: description,
        approver_id: approver,
        on_behalf_of: behalf,
        response_value: [answer],
        question_option_id: optionIdList?.includes(question_id)
          ? question_id
          : null,
      });
    }

    return formTableRecord;
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => {
      return prev.map((answer) => {
        if (`${questionId}` === `${answer.questionId}`) {
          return {
            questionId: questionId,
            value: value,
          };
        } else {
          return answer;
        }
      });
    });
  };

  return (
    <Container m={0} px={8} py={16} fluid>
      <LoadingOverlay visible={isCreating || isLoading} />
      <Title>Create {formName}</Title>
      <Paper shadow="xl" radius={8} mt={32} px={32} py={48}>
        <form onSubmit={onSubmit}>
          <Stack>
            <Flex gap="xl" wrap="wrap">
              <Flex gap="xl" wrap="wrap" className={styles.flex3}>
                <TextInput
                  label="Requestor"
                  disabled
                  className={styles.flex3}
                  miw={220}
                  withAsterisk
                  {...register("requestor", {
                    required: "Requestor is Required",
                  })}
                  error={errors.requestor?.message}
                />
                <TextInput
                  label="Date Created"
                  disabled
                  className={styles.flex1}
                  miw={100}
                  withAsterisk
                  {...register("date", {
                    required: "Date Created is Required",
                  })}
                  error={errors.date?.message}
                />
              </Flex>
              <Select
                label="Approver"
                data={approvers}
                className={styles.flex2}
                miw={220}
                withAsterisk
                value={selectedApprover}
                onChange={setSelectedApprover}
              />
            </Flex>
            <Flex gap="xl" wrap="wrap">
              <TextInput
                label="Request Title"
                className={styles.flex3}
                miw={220}
                withAsterisk
                {...register("title", {
                  required: "Title is Required",
                })}
                error={errors.title?.message}
              />
              <TextInput
                label="On Behalf Of"
                className={styles.flex2}
                miw={220}
                {...register("behalf")}
              />
            </Flex>
            <Textarea
              label="Request Description"
              autosize
              minRows={4}
              withAsterisk
              {...register("description", {
                required: "Request Description is Required",
              })}
              error={errors.description?.message}
            />

            {formTemplate?.map((form, index) => {
              if (
                form.question.expected_response_type === "text" ||
                form.question.expected_response_type === "email"
              ) {
                return (
                  <TextInput
                    key={form.form_id}
                    label={form.question.question}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, e.target.value)
                    }
                    value={answers[index].value}
                  />
                );
              } else if (form.question.expected_response_type === "number") {
                return (
                  <NumberInput
                    key={form.form_id}
                    label={form.question.question}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    value={Number(answers[index].value)}
                  />
                );
              } else if (form.question.expected_response_type === "date") {
                return (
                  <DatePicker
                    key={form.form_id}
                    label={form.question.question}
                    placeholder={"Choose date"}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    defaultValue={
                      answers[index].value
                        ? new Date(answers[index].value)
                        : null
                    }
                  />
                );
              } else if (form.question.expected_response_type === "daterange") {
                const dates = answers[index].value.split(",");
                return (
                  <DateRangePicker
                    key={form.form_id}
                    label={form.question.question}
                    placeholder={"Choose a date range"}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    defaultValue={
                      dates[0]
                        ? [new Date(dates[0]), new Date(dates[1])]
                        : [null, null]
                    }
                  />
                );
              } else if (form.question.expected_response_type === "time") {
                return (
                  <TimeInput
                    key={form.form_id}
                    label={form.question.question}
                    placeholder={"Choose time"}
                    format="12"
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    defaultValue={
                      answers[index].value
                        ? new Date(answers[index].value)
                        : null
                    }
                  />
                );
              } else if (form.question.expected_response_type === "slider") {
                return (
                  <Box my="md" key={form.form_id}>
                    <Text component="label" color="dark">
                      {form.question.question}
                    </Text>
                    <Slider
                      label={form.question.question}
                      placeholder={"Slide to choose value"}
                      marks={MARKS}
                      min={1}
                      max={5}
                      labelAlwaysOn={false}
                      onChange={(e) =>
                        handleAnswer(`${form.question_id}`, `${e}`)
                      }
                      value={Number(answers[index].value)}
                    />
                  </Box>
                );
              } else if (
                form.question.expected_response_type === "multiple" &&
                form.question_option.question_option !== null
              ) {
                return (
                  <MultiSelect
                    key={form.form_id}
                    data={form.question_option.question_option.map((option) => {
                      return { value: `${option}`, label: `${option}` };
                    })}
                    label={form.question.question}
                    placeholder={"Choose multiple"}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    value={answers[index].value.split(",")}
                  />
                );
              } else if (
                form.question.expected_response_type === "select" &&
                form.question_option.question_option !== null
              ) {
                return (
                  <Select
                    key={form.form_id}
                    data={form.question_option.question_option.map((option) => {
                      return { value: `${option}`, label: `${option}` };
                    })}
                    searchable
                    clearable
                    label={form.question.question}
                    placeholder={"Choose one"}
                    onChange={(e) =>
                      handleAnswer(`${form.question_id}`, `${e}`)
                    }
                    value={answers[index].value}
                  />
                );
              }
            })}

            <Group position="right">
              <Button mt="xl" size="md" px={50} type="submit">
                CREATE
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateRequest;
