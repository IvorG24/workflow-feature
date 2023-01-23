import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import CreateRequestContext from "@/contexts/CreateRequestContext";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import { uploadFile } from "@/utils/file";
import {
  createRequest,
  CreateRequestParams,
  GetFormTemplate,
  updateRequestDraft,
  UpdateRequestDraftInput,
} from "@/utils/queries-new";
import { renderTooltip, setBadgeColor } from "@/utils/request";
import type { Database, Marks } from "@/utils/types";
import { ResponseList } from "@/utils/types-new";
import {
  Badge,
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
  const { teamMemberList, approverIdList, purchaserIdList } =
    useContext(ActiveTeamContext);
  const currentUserProfileContext = useContext(CurrentUserProfileContext);

  const currentUserProfile = currentUserProfileContext;
  const { formTemplate } = createRequestContext || {};

  const formName = (formTemplate && formTemplate[0].form_name) || "";
  const requestTitle = (formTemplate && formTemplate[0].request_title) || "";
  const requestDescription =
    (formTemplate && formTemplate[0].request_description) || "";
  const requestOnBehalfOf =
    (formTemplate && formTemplate[0].request_on_behalf_of) || "";
  const requestedBy = currentUserProfile?.username || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<RequestFieldsType>({
    defaultValues: {
      title: requestTitle,
      behalf: requestOnBehalfOf,
      description: requestDescription,
      requestor: requestedBy,
      date: `${new Date().toLocaleDateString()}`,
    },
  });

  // Sample value of approverList
  // {
  //   label: "John Doe",
  //   value: "1",
  // }
  const approverList =
    teamMemberList
      .filter(
        (approver) =>
          approverIdList.includes(approver.user_id as string) &&
          approver.user_id !== user?.id
      )
      .map((approver) => ({
        label: approver.username,
        value: approver.user_id,
      })) || [];

  const purchaserList =
    teamMemberList
      .filter(
        (approver) =>
          purchaserIdList.includes(approver.user_id as string) &&
          approver.user_id !== user?.id
      )
      .map((approver) => ({
        label: approver.username,
        value: approver.user_id,
      })) || [];

  const approverId = createRequestContext?.approverList.find((approver) =>
    approverIdList.includes(approver.user_id as string)
  )?.user_id;

  const purchaserId = createRequestContext?.approverList.find((approver) =>
    purchaserIdList.includes(approver.user_id as string)
  )?.user_id;

  const [selectedApprover, setSelectedApprover] = useState<string | null>();
  const [selectedPurchaser, setSelectedPurchaser] = useState<string | null>();

  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [newFields, setNewFields] = useState<GetFormTemplate | null>();
  const [isDraft, setIsDraft] = useState(
    formTemplate && formTemplate[0].request_is_draft
  );

  useBeforeunload(() => {
    if (isDraft) {
      handleUpdateDraft();
    } else {
      handleCreateDraft();
    }
  });

  useEffect(() => {
    if (!router.isReady) return;
    setIsLoading(true);
    reset();
    setNewFields(formTemplate);
    setSelectedApprover(approverId || null);
    setSelectedPurchaser(purchaserId || null);
    const isDraft = formTemplate && formTemplate[0].request_is_draft;
    if (isDraft) {
      setValue("title", requestTitle);
      setValue("behalf", requestOnBehalfOf);
      setValue("description", requestDescription);
      setValue("requestor", requestedBy);
      setValue("date", `${new Date().toLocaleDateString()}`);
      setIsDraft(true);
    }
    setIsLoading(false);
  }, [router]);

  const onSubmit = handleSubmit((formData) =>
    isDraft ? handleUpdateDraft(false) : handleSave(formData)
  );

  const handleUpdateDraft = async (isDraft = true) => {
    let filepath;
    if (!isDraft) {
      if (!selectedApprover) {
        showNotification({
          title: "Error!",
          message: "Please select an approver",
          color: "red",
        });
        return;
      }
      setIsCreating(true);
      // Call the uploadFile function first so that if the attachment upload fails, the request will not be created.
      if (file) {
        const { path } = await uploadFile(
          supabase,
          file.name,
          file,
          "request_attachments"
        );
        filepath = path;
      }
    }

    const formData = getValues();
    try {
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

      const responseList: ResponseList = {};

      newFields &&
        newFields.forEach((field) => {
          if (field.response_value)
            responseList[`${field.response_id}`] = field.response_value;
        });

      const requestId = formTemplate && formTemplate[0].request_id;

      if (!requestId) throw new Error("Request ID is not defined");
      const requestInput: UpdateRequestDraftInput = {
        request_id: requestId,
        request_is_draft: isDraft,
        request_title: formData.title,
        request_description: formData.description,
        request_on_behalf_of: formData.behalf,
        request_attachment_filepath_list: filepath ? [filepath] : [],
      };
      await updateRequestDraft(
        supabase,
        requestInput,
        responseList,
        approverList
      );
      if (!isDraft)
        await router.push(
          `/t/${
            router.query.tid as string
          }/requests?active_tab=all&page=1&form=${
            formTemplate && formTemplate[0].form_id
          }`
        );
    } catch (error) {
      console.error(error);
      if (!isDraft)
        showNotification({
          title: "error",
          message: "Error creating request",
        });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateDraft = async () => {
    const formData = getValues();
    try {
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
          request_is_draft: true,
          request_attachment_filepath_list: [],
        },
        approverList,
        responseList,
      };

      await createRequest(supabase, createRequestParams);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

      let filepath;
      // Call the uploadFile function first so that if the attachment upload fails, the request will not be created.
      if (file) {
        const { path } = await uploadFile(
          supabase,
          file.name,
          file,
          "request_attachments"
        );
        filepath = path;
      }

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
          request_attachment_filepath_list: filepath ? [filepath] : [],
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
        `/t/${router.query.tid}/requests?active_tab=all&page=1&form=${router.query.formId}`
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
      <Title>Create {formName}</Title>
      {isDraft && <Badge color={setBadgeColor("approved")}>Draft</Badge>}
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
                data={
                  approverList as {
                    label: string;
                    value: string;
                  }[]
                }
                className={styles.flex2}
                miw={220}
                withAsterisk
                value={selectedApprover}
                onChange={setSelectedApprover}
                data-cy="select-approver"
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
                  data-cy="request-title"
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
                data={
                  purchaserList as {
                    label: string;
                    value: string;
                  }[]
                }
                className={styles.flex2}
                miw={220}
                value={selectedPurchaser}
                onChange={setSelectedPurchaser}
                clearable
                data-cy="select-purchaser"
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
              data-cy="request-description"
            />
            <FileInput
              value={file}
              onChange={setFile}
              accept="image/png,image/jpeg,image/jpg"
              label="Image Attachment"
              placeholder="Select file"
              icon={<IconUpload size={14} />}
              data-cy="upload-file"
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
              <Button
                mt="xl"
                size="md"
                px={50}
                type="submit"
                data-cy="request-submit"
              >
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
