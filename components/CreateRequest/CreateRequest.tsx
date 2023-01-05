import CreateRequestContext from "@/contexts/CreateRequestContext";
import {
  createRequest,
  CreateRequestParams,
  GetFormTemplate,
} from "@/utils/queries-new";
import { renderTooltip } from "@/utils/request";
import type { Database, Marks } from "@/utils/types";
import { FormRow } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  FileInput,
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
import { IconUpload } from "@tabler/icons";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./CreateRequest.module.scss";

type RequestFieldsType = {
  requestor: string;
  date: string;
  title: string;
  behalf: string;
  description: string;
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
  const createRequestContext = useContext(CreateRequestContext);
  const { formTemplate, purchaserList, approverList, currentUserProfile } =
    createRequestContext || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFieldsType>({
    defaultValues: {
      title: "",
      behalf: "",
      description: "",
      requestor: currentUserProfile?.username || "",
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  const [selectedApprover, setSelectedApprover] = useState<string | null>(
    approverList && approverList[0]?.value ? approverList[0].value : null
  );
  const [selectedPurchaser, setSelectedPurchaser] = useState<string | null>(
    null
  );

  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [newFields, setNewFields] = useState<GetFormTemplate | null>(
    formTemplate
  );

  // useBeforeunload(() => {
  //   if (Boolean(draftId)) {
  //     axios.post("/api/update", {
  //       answers: fields,
  //       requestId: draftId,
  //       formData: getValues(),
  //       approver: selectedApprover,
  //       purchaser: selectedPurchaser,
  //     });
  //   } else {
  //     axios.post("/api/insert", {
  //       formData: getValues(),
  //       formId: router.query.formId,
  //       userId: user?.id,
  //       approver: selectedApprover,
  //       purchaser: selectedPurchaser,
  //       answers: fields,
  //     });
  //   }
  // });

  const resetState = () => {
    setIsLoading(true);
    reset();
    setForm(null);
    setDraftId(null);
  };

  useEffect(() => {
    if (!router.isReady) return;
    resetState();

    // const fetchDraft = async (request_id: number) => {
    //   setDraftId(request_id);
    //   try {
    //     const retrievedRequestDraft = await retreivedRequestDraftByRequestId(
    //       supabase,
    //       request_id
    //     );
    //     if (!retrievedRequestDraft) return;

    //     setValue("title", `${retrievedRequestDraft.request_title}`);
    //     setValue("description", `${retrievedRequestDraft.request_description}`);
    //     setValue("behalf", `${retrievedRequestDraft.on_behalf_of}`);

    //     const retrievedRequestResponse = await retrieveRequestResponse(
    //       supabase,
    //       retrievedRequestDraft.request_id,
    //       Number(router.query.formId)
    //     );

    //     const fieldsWithResponse = retrievedRequestResponse.map(
    //       (field, index) => {
    //         return {
    //           ...field.field,
    //           response: `${field.response_value}`,
    //           responseId: index,
    //         };
    //       }
    //     );

    //     // setFields(fieldsWithResponse);
    //     // setForm(retrievedRequestDraft.form);
    //     // setSelectedApprover(retrievedRequestDraft.approver_id);
    //   } catch {
    //     showNotification({
    //       title: "Error!",
    //       message: "Failed to fetch Request Draft",
    //       color: "red",
    //     });
    //   }
    // };

    // fetchRequest();
    setIsLoading(false);
  }, [supabase, router, user]);

  const onSubmit = handleSubmit((formData) =>
    draftId ? handleUpdate(formData) : handleSave(formData)
  );

  const handleUpdate = async (formData: RequestFieldsType) => {
    setIsCreating(true);
    console.log(formData);
    try {
      // const requestResponseList = fields.map((field) => {
      //   return {
      //     field_id: Number(field.field_id),
      //     response_value: field.response,
      //     request_id: Number(draftId),
      //   };
      // });

      // await updateRequestReponse(
      //   supabase,
      //   requestResponseList,
      //   Number(draftId)
      // );

      // await updateRequest(
      //   supabase,
      //   `${selectedApprover}`,
      //   selectedPurchaser,
      //   formData,
      //   Number(draftId)
      // );

      showNotification({
        title: "Success!",
        message: "Request sent for approval",
        color: "green",
      });
      router.push(
        `/t/${router.query.tid}/requests?formId=${router.query.formId}`
      );
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to Save Request",
        color: "red",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (formData: RequestFieldsType) => {
    try {
      if (!selectedApprover) {
        showNotification({
          title: "Error!",
          message: "Please select an approver",
          color: "red",
        });
        return;
      }
      setIsCreating(true);

      // let filepath;
      // // * Upload file first if existing so if upload failed, request won't be created.
      // if (file) {
      //   const { path } = await uploadFile(
      //     supabase,
      //     file.name,
      //     file,
      //     "request-attachments"
      //   );
      //   filepath = path;
      // }

      // const savedRequest = await saveRequest(
      //   supabase,
      //   `${selectedApprover}`,
      //   selectedPurchaser,
      //   formData,
      //   `${user?.id}`,
      //   Number(router.query.formId),
      //   filepath
      // );

      // const requestResponse = fields.map((field) => {
      //   return {
      //     field_id: Number(field.field_id),
      //     request_id: savedRequest.request_id,
      //     response_value: field.response,
      //   };
      // });

      // await saveRequestField(supabase, requestResponse);

      const approverList: CreateRequestParams["approverList"] = [];
      if (selectedApprover) {
        approverList.push({
          user_id: selectedApprover,
          request_status_id: "pending",
        });
      }
      if (selectedPurchaser) {
        approverList.push({
          user_id: selectedPurchaser,
          request_status_id: "pending",
        });
      }

      const responseList: CreateRequestParams["responseList"] = {};

      newFields &&
        newFields.forEach((field) => {
          responseList[`${field.field_id}`] = field.response_value || "";
        });

      const createRequestParams: CreateRequestParams = {
        formId: Number(router.query.formId),
        userId: user?.id as string,
        teamId: router.query.tid as string,
        request: {
          request_title: formData.title,
          request_description: formData.description,
          request_on_behalf_of: formData.behalf,
          request_is_draft: false,
        },
        approverList,
        responseList,
      };

      const requestId = await createRequest(supabase, createRequestParams);

      showNotification({
        title: "Success!",
        message: `Request Created: ${requestId}`,
        color: "green",
      });

      router.push(
        `/t/${router.query.tid}/requests?formId=${router.query.formId}`
      );
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to Create Request!",
        color: "red",
      });
      setIsCreating(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAnswer = (fieldId: number, value: string) => {
    // Update the input field.
    setNewFields((prev) => {
      return (
        prev &&
        prev.map((field) => {
          if (Number(field.field_id) === fieldId) {
            return {
              ...field,
              response_value: value,
            };
          }
          return field;
        })
      );
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
                data={approverList || []}
                className={styles.flex2}
                miw={220}
                withAsterisk
                value={selectedApprover}
                onChange={setSelectedApprover}
              />
            </Flex>
            <Flex gap="xl" wrap="wrap">
              <Flex gap="xl" wrap="wrap" className={styles.flex3}>
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
                  className={styles.flex1}
                  miw={220}
                  {...register("behalf")}
                />
              </Flex>
              <Select
                label="Purchaser"
                data={purchaserList || []}
                className={styles.flex2}
                miw={220}
                value={selectedPurchaser}
                onChange={setSelectedPurchaser}
                clearable
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
            <FileInput
              value={file}
              onChange={setFile}
              accept="image/png,image/jpeg,image/jpg"
              label="Image Attachment"
              placeholder="Select file"
              icon={<IconUpload size={14} />}
            />

            {/* // TODO: Loop per form fact view because form fat view are basically field list. */}
            {newFields &&
              newFields.map((field) => {
                if (field.request_field_type === "section") {
                  return (
                    <Divider
                      key={field.field_id}
                      label={field.field_name}
                      labelPosition="center"
                    />
                  );
                } else if (
                  field.request_field_type === "text" ||
                  field.request_field_type === "email"
                ) {
                  return renderTooltip(
                    <TextInput
                      key={field.field_id}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), e.target.value)
                      }
                      value={field.response_value || ""}
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (field.request_field_type === "number") {
                  return renderTooltip(
                    <NumberInput
                      key={field.field_id}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      value={Number(field.response_value)}
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (field.request_field_type === "date") {
                  return renderTooltip(
                    <DatePicker
                      key={field.field_id}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      placeholder={"Choose date"}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      defaultValue={
                        field.response_value
                          ? new Date(field.response_value)
                          : null
                      }
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (field.request_field_type === "daterange") {
                  const dates = field.response_value
                    ? field.response_value.split(",")
                    : ["", ""];
                  return renderTooltip(
                    <DateRangePicker
                      key={field.field_id}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      placeholder={"Choose a date range"}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      defaultValue={
                        dates[0]
                          ? [new Date(dates[0]), new Date(dates[1])]
                          : [null, null]
                      }
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (field.request_field_type === "time") {
                  return renderTooltip(
                    <TimeInput
                      key={field.field_id}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      placeholder={"Choose time"}
                      format="12"
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      defaultValue={
                        field.response_value
                          ? new Date(field.response_value)
                          : null
                      }
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (field.request_field_type === "slider") {
                  return (
                    <Box my="md" key={field.field_id}>
                      {renderTooltip(
                        <Text component="label" color="dark">
                          {field.field_name}
                        </Text>,
                        `${field.field_tooltip}`
                      )}
                      <Slider
                        label={field.field_name}
                        placeholder={"Slide to choose value"}
                        marks={MARKS}
                        min={1}
                        max={5}
                        labelAlwaysOn={false}
                        onChange={(e) =>
                          handleAnswer(Number(field.field_id), `${e}`)
                        }
                        value={Number(field.response_value)}
                      />
                    </Box>
                  );
                } else if (
                  field.request_field_type === "multiple" &&
                  field.field_options !== null
                ) {
                  return renderTooltip(
                    <MultiSelect
                      key={field.field_id}
                      data={field.field_options.map((option) => {
                        return { value: `${option}`, label: `${option}` };
                      })}
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      placeholder={"Choose multiple"}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      value={
                        field.response_value
                          ? field.response_value.split(",")
                          : []
                      }
                    />,
                    `${field.field_tooltip}`
                  );
                } else if (
                  field.request_field_type === "select" &&
                  field.field_options !== null
                ) {
                  return renderTooltip(
                    <Select
                      key={field.field_id}
                      data={field.field_options.map((option) => {
                        return { value: `${option}`, label: `${option}` };
                      })}
                      searchable
                      clearable
                      label={field.field_name}
                      withAsterisk={Boolean(field.field_is_required)}
                      placeholder={"Choose one"}
                      onChange={(e) =>
                        handleAnswer(Number(field.field_id), `${e}`)
                      }
                      value={field.response_value}
                    />,
                    `${field.field_tooltip}`
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
