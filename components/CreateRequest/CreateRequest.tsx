import type { Database, RequestRow } from "@/utils/types";
import { FieldRow, FormRow, RequestResponseRow } from "@/utils/types";
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

type RequestFieldsType = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  description: string;
};

type RequestType = RequestRow & { form: FormRow };
type RequestResponseType = RequestResponseRow & { field: FieldRow };

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
  } = useForm<RequestFieldsType>({
    defaultValues: {
      title: "",
      behalf: "",
      description: "",
      requestor: "",
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  const [selectedApprover, setSelectedApprover] = useState<string | null>(null);
  const [approvers, setApprovers] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormRow | null>(null);
  const [fields, setFields] = useState<
    (FieldRow & { response: string; responseId: number | null })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draftId, setDraftId] = useState<number | null>(null);

  useBeforeunload(() => {
    if (Boolean(draftId)) {
      axios.post("/api/update", {
        answers: fields,
        requestId: draftId,
      });
    } else {
      axios.post("/api/insert", {
        formData: getValues(),
        formId: router.query.formId,
        userId: user?.id,
        approver: selectedApprover,
        answers: fields,
      });
    }
  });

  const resetState = () => {
    reset();
    setApprovers([]);
    setForm(null);
    setFields([]);
    setDraftId(null);
  };

  useEffect(() => {
    if (!router.isReady) return;
    resetState();
    setIsLoading(true);
    // TODO add eq("team_id")
    const fetchApprovers = async () => {
      try {
        // todo: fetch from team_role
        const { data, error } = await supabase
          .from("user_profile_table")
          .select("*");
        if (error) throw new Error();
        // TODO remove current user if the current user is an admin

        const approvers = data.map((approver) => {
          return {
            label: `${approver.full_name}`,
            value: `${approver.user_id}`,
          };
        });

        const newApprovers = approvers.filter(
          (approver) => approver.value !== user?.id
        );
        setApprovers(newApprovers);
        setSelectedApprover(newApprovers[0].value);
      } catch {
        showNotification({
          title: "Error!",
          message: "Faield to fetch Approvers",
          color: "red",
        });
      }
    };

    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from("request_table")
          .select("*")
          .eq("is_draft", true)
          .eq("form_table_id", router.query.formId)
          .eq("response_owner", user?.id)
          .single();
        if (error) throw new Error();

        data ? fetchDraft(data.request_id) : handleFetchForm();
      } catch {
        showNotification({
          title: "Error!",
          message: "Faield to fetch Request",
          color: "red",
        });
      }
    };

    const handleFetchForm = async () => {
      try {
        const { data: form, error: formError } = await supabase
          .from("form_table")
          .select("*")
          .eq("form_id", router.query.formId)
          .single();

        if (!form || formError) throw new Error();

        const { data: fields, error: fieldsError } = await supabase
          .from("field_table")
          .select("*")
          .eq("form_table_id", form.form_id);

        if (fieldsError) throw new Error();

        setFields(
          fields.map((field) => {
            return { ...field, response: "", responseId: null };
          })
        );
        setForm(form);
      } catch {
        showNotification({
          title: "Error!",
          message: "Faield to fetch Form",
          color: "red",
        });
      }
    };

    const fetchDraft = async (request_id: number) => {
      setDraftId(request_id);
      try {
        const { data: request, error: requestError } = await supabase
          .from("request_table")
          .select("*, form: form_table_id(*)")
          .eq("request_id", request_id)
          .single();
        const newRequest = request as RequestType;

        if (!request || requestError) throw new Error();

        setValue("title", `${request.request_title}`);
        setValue("description", `${request.request_description}`);
        setValue("behalf", `${request.on_behalf_of}`);

        const { data: requestFields, error: requestFieldsError } =
          await supabase
            .from("request_response_table")
            .select("*, field: field_id(*)")
            .eq("request_id", request.request_id);
        const newRequestFields = requestFields as RequestResponseType[];

        if (!request || requestFieldsError) throw new Error();

        const fieldsWithResponse = newRequestFields.map((field) => {
          return {
            ...field.field,
            response: `${field.response_value}`,
            responseId: field.request_id,
          };
        });
        setFields(fieldsWithResponse);
        setForm(newRequest.form);
      } catch {
        showNotification({
          title: "Error!",
          message: "Faield to fetch Request Draft",
          color: "red",
        });
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile_table")
          .select("*")
          .eq("user_id", user?.id)
          .single();
        if (!data || error) throw new Error();
        setValue("requestor", `${data.full_name}`);
      } catch {
        showNotification({
          title: "Error!",
          message: "Faield to fetch Current User",
          color: "red",
        });
      }
    };

    fetchCurrentUser();
    fetchApprovers();
    fetchRequest();
    setIsLoading(false);
  }, [supabase, router, user]);

  const onSubmit = handleSubmit((formData) =>
    draftId ? handleUpdate(formData) : handleSave(formData)
  );

  const handleUpdate = async (formData: RequestFieldsType) => {
    setIsCreating(true);
    try {
      const requestResponseList = fields.map((field) => {
        return {
          field_id: Number(field.field_id),
          response_value: field.response,
          request_id: Number(field.responseId),
        };
      });

      const { error: requestResponseError } = await supabase
        .from("request_response_table")
        .upsert(requestResponseList);

      if (requestResponseError) throw new Error();

      const { error: requestError } = await supabase
        .from("request_table")
        .update({
          approver_id: selectedApprover,
          request_created_at: `${new Date()}`,
          request_title: formData.title,
          on_behalf_of: formData.behalf,
          request_description: formData.description,
          is_draft: false,
        })
        .eq("request_id", draftId);

      if (requestError) throw new Error();

      showNotification({
        title: "Success!",
        message: "Request sent for approval",
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to Save Request",
        color: "red",
      });
    }
  };

  const handleSave = async (formData: RequestFieldsType) => {
    try {
      setIsCreating(true);

      const { data: request, error: requestError } = await supabase
        .from("request_table")
        .insert({
          approver_id: selectedApprover,
          requested_by: user?.id,
          form_table_id: form?.form_id,
          request_title: formData.title,
          on_behalf_of: formData.behalf,
          request_description: formData.description,
          is_draft: false,
        })
        .select()
        .single();

      if (requestError) throw new Error();

      const requestResponse = fields.map((field) => {
        return {
          field_id: Number(field.responseId),
          request_id: request.request_id,
          response_value: field.response,
        };
      });
      const { error: requestResponseError } = await supabase
        .from("request_response_table")
        .insert(requestResponse);

      if (requestResponseError) throw new Error();

      showNotification({
        title: "Success!",
        message: "Request Created",
        color: "green",
      });

      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to Create Request!",
        color: "red",
      });
      setIsCreating(false);
    }
  };

  const handleAnswer = (questionId: number, value: string) => {
    setFields((prev) => {
      return prev.map((answer) => {
        if (questionId === answer.field_id) {
          return {
            ...answer,
            responseId: questionId,
            response: value,
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
      <Title>Create {form?.form_name}</Title>
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

            {fields?.map((field) => {
              if (field.field_type === "text" || field.field_type === "email") {
                return (
                  <TextInput
                    key={field.field_id}
                    label={field.field_name}
                    onChange={(e) =>
                      handleAnswer(
                        Number(`${field.responseId}`),
                        e.target.value
                      )
                    }
                    value={field.response}
                  />
                );
              } else if (field.field_type === "number") {
                return (
                  <NumberInput
                    key={field.field_id}
                    label={field.field_name}
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    value={Number(field.response)}
                  />
                );
              } else if (field.field_type === "date") {
                return (
                  <DatePicker
                    key={field.field_id}
                    label={field.field_name}
                    placeholder={"Choose date"}
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    defaultValue={
                      field.response ? new Date(field.response) : null
                    }
                  />
                );
              } else if (field.field_type === "daterange") {
                const dates = field.response.split(",");
                return (
                  <DateRangePicker
                    key={field.field_id}
                    label={field.field_name}
                    placeholder={"Choose a date range"}
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    defaultValue={
                      dates[0]
                        ? [new Date(dates[0]), new Date(dates[1])]
                        : [null, null]
                    }
                  />
                );
              } else if (field.field_type === "time") {
                return (
                  <TimeInput
                    key={field.field_id}
                    label={field.field_name}
                    placeholder={"Choose time"}
                    format="12"
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    defaultValue={
                      field.response ? new Date(field.response) : null
                    }
                  />
                );
              } else if (field.field_type === "slider") {
                return (
                  <Box my="md" key={field.field_id}>
                    <Text component="label" color="dark">
                      {field.field_name}
                    </Text>
                    <Slider
                      label={field.field_name}
                      placeholder={"Slide to choose value"}
                      marks={MARKS}
                      min={1}
                      max={5}
                      labelAlwaysOn={false}
                      onChange={(e) =>
                        handleAnswer(Number(`${field.responseId}`), `${e}`)
                      }
                      value={Number(field.response)}
                    />
                  </Box>
                );
              } else if (
                field.field_type === "multiple" &&
                field.field_option !== null
              ) {
                return (
                  <MultiSelect
                    key={field.field_id}
                    data={field.field_option.map((option) => {
                      return { value: `${option}`, label: `${option}` };
                    })}
                    label={field.field_name}
                    placeholder={"Choose multiple"}
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    value={field.response.split(",")}
                  />
                );
              } else if (
                field.field_type === "select" &&
                field.field_option !== null
              ) {
                return (
                  <Select
                    key={field.field_id}
                    data={field.field_option.map((option) => {
                      return { value: `${option}`, label: `${option}` };
                    })}
                    searchable
                    clearable
                    label={field.field_name}
                    placeholder={"Choose one"}
                    onChange={(e) =>
                      handleAnswer(Number(`${field.responseId}`), `${e}`)
                    }
                    value={field.response}
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
