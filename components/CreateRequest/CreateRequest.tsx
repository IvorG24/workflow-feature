import type { Database } from "@/utils/types";
import { UserProfile } from "@/utils/types";
import {
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./CreateRequest.module.scss";

type FormData = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  description: string;
};

const CreateRequest = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      // TODO When authentication is implemented
      requestor: "Lance Juat",
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  const [selectedApprover, setSelectedApprover] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [approvers, setApprovers] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // TODO add eq("team_id")
    const fetchForm = async () => {
      const { data } = await supabase
        .from("form_name_table")
        .select("*")
        .eq("form_name_id", router.query.formId)
        .single();

      setFormName(`${data?.form_name}`);
    };
    const fetchApprovers = async () => {
      const { data, error } = await supabase
        .from("team_role_table")
        .select("user_id(*)")
        .eq("team_role", "manager")
        .eq("lock_account", false);
      console.log(error);
      // TODO remove current user if the current user is a manager

      // TODO better way to assign type
      const userIds = data?.map((approver) => approver.user_id);

      const tempApprovers = userIds as UserProfile[];
      const approvers = tempApprovers.map((approver) => {
        return {
          label: `${approver.full_name}`,
          value: `${approver.user_id}`,
        };
      });

      if (approvers !== undefined) {
        setApprovers(approvers);
        setSelectedApprover(approvers[0].value);
      }
    };
    fetchForm();
    fetchApprovers();
  }, [supabase, router]);

  const onSubmit = handleSubmit(async (formData) => {
    // TODO team_id and current user's id
    setIsCreating(true);
    const { data } = await supabase
      .from("request_table")
      .insert({})
      .select()
      .single();

    const { error } = await supabase.from("form_table").insert({
      form_name_id: Number(`${router.query.formId}`),
      team_id: null,
      request_title: formData.title,
      request_description: formData.description,
      approver_id: selectedApprover,
      approval_status: "pending",
      response_owner: "a736f878-05f9-4e2b-8386-0f3e55762206",
      request_id: Number(`${data?.request_id}`),
    });
    if (error) {
      showNotification({
        title: "Failed to Create Request!",
        message: error.message,
        color: "red",
      });
      setIsCreating(false);
    } else {
      showNotification({
        title: "Success!",
        message: "Request Created",
        color: "green",
      });
      router.push("/requests");
    }
  });

  return (
    <Container m={0} px={8} py={16} fluid>
      <LoadingOverlay visible={isCreating} />
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
