import {
  Button,
  Container,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./CreateRequest.module.scss";

const tempApprovers = [
  "Reynalyn Caudilla",
  "Miguel Linao",
  "Arianne Roxas",
  "Christine Molina",
  "John Blanco",
  "Renin Belo",
];

type FormData = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  details: string;
};

const CreateRequest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      requestor: "Lance Juat",
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  const [selectedApprover, setSelectedApprover] = useState<string | null>(
    tempApprovers[0]
  );

  const onSubmit = handleSubmit((data) => {
    console.log({ ...data, selectedApprover });
  });

  return (
    <Container m={0} px={8} py={16} fluid>
      <Title>Create Approval Request</Title>
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
                data={tempApprovers}
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
              label="Request Details"
              autosize
              minRows={4}
              withAsterisk
              {...register("details", {
                required: "Request Details is Required",
              })}
              error={errors.details?.message}
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
