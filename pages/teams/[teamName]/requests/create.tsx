import Layout from "@/components/Layout/Layout";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CloseButton,
  Container,
  createStyles,
  Divider,
  Group,
  List,
  LoadingOverlay,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconCircleDashed,
  IconGripVertical,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";
import { FileRejection } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

import PolymorphicFieldInput from "@/components/BuildFormPage/PolymorphicFieldInput";
import { RequestDropzone } from "@/components/CreateRequestPage/RequestDropzone";
import { uploadFile } from "@/utils/file";
import {
  addComment,
  createRequest,
  CreateRequestParams,
  getFormApproverList,
  getFormByTeamAndFormName,
  getUserProfile,
} from "@/utils/queries";
import { RequestFieldType } from "@/utils/types";
import { FileWithPath } from "@mantine/dropzone";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import {
  DragDropContext,
  Draggable,
  Droppable,
  resetServerContext,
} from "react-beautiful-dnd";

const useStyles = createStyles((theme) => ({
  container: {
    // add subtle background and border design.
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    maxWidth: theme.breakpoints.sm,
  },
  item: {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.md,
    // border: `1px solid ${
    //   theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    // }`,
    padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
    paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    marginBottom: theme.spacing.sm,
    border: "1px solid #ccc",
    boxShadow: "2px 2px 5px #ccc",
  },

  add: {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.md,
    // border: `1px solid ${
    //   theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    // }`,
    padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
    paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
    // backgroundColor:
    //   theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,

    marginBottom: theme.spacing.sm,
    border: "1px solid #ccc",
    boxShadow: "2px 2px 5px #ccc",
  },

  itemDragging: {
    boxShadow: theme.shadows.sm,
  },

  type: {
    fontSize: 30,
    fontWeight: 700,
    width: 60,
  },

  dragHandle: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
  },
}));

export type DndListHandleProps = {
  data: {
    id: string;
    type: string;
    label: string;
    value: string;
    optionList: string[];
    optionTooltipList: string[];
    isRequired: boolean;
    tooltip: string;
    duplicatedId?: string;
  }[];
};

export type RequestTrail = {
  data: {
    approverId: string;
    approverUsername: string;
    approverActionId: string;
    approverActionName: string;
    isPrimaryApprover: boolean;
  }[];
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  resetServerContext();

  const supabaseClient = createServerSupabaseClient(ctx);

  if (!ctx.query.teamName || !ctx.query.form) {
    return {
      notFound: true,
    };
  }

  const form = await getFormByTeamAndFormName(
    supabaseClient,
    ctx.query.teamName as string,
    ctx.query.form as string
  );

  if (!form) {
    return {
      notFound: true,
    };
  }
  if (form.length === 0) {
    return {
      notFound: true,
    };
  }
  if (form[0].form_is_hidden || form[0].form_is_disabled) {
    return {
      notFound: true,
    };
  }

  const formApprovers = await getFormApproverList(
    supabaseClient,
    form[0].form_id as number
  );

  // Transform to DndListHandleProps and RequestTrail so frontend can handle data easier.
  const dndList: DndListHandleProps = {
    data: form.map((form) => ({
      id: (form.field_id as number).toString(),
      type: form.form_fact_field_type_id as string,
      label: form.field_name as string,
      value: "",
      optionList: form.field_option_list || [],
      optionTooltipList: form.field_option_tooltip_list as string[],
      isRequired: !!form.field_is_required,
      tooltip: form?.field_tooltip || "",
    })),
  };

  const trail: RequestTrail = {
    data: formApprovers.map((formApprover) => {
      return {
        approverId: formApprover.user_id as string,
        approverActionId: formApprover.form_approver_action_id as string,
        approverActionName: formApprover.action_name as string,
        approverUsername: formApprover.username as string,
        isPrimaryApprover: !!formApprover.form_approver_is_primary_approver,
      };
    }),
  };

  return {
    props: {
      form,
      dndList,
      trail,
    },
  };
};

const CreateRequestPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ form, dndList, trail }) => {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState<DndListHandleProps["data"][0]>(
    dndList.data
  );
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const user = useUser();
  const requestTrail = trail.data;
  const primaryApproverId = requestTrail.find(
    (approver) => approver.isPrimaryApprover
  )?.approverId;

  const formName = form[0].form_name as string;
  const formId = form[0].form_id as number;
  const teamId = form[0].team_id as string;
  const teamName = form[0].team_name as string;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const items = state.map((item, index) => (
    // Original
    // <Draggable key={item.type} index={index} draggableId={item.type}>
    <Draggable key={item.id} index={index} draggableId={item.id} isDragDisabled>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical size={18} stroke={1.5} />
          </div>
          {/* <Text className={classes.type}>{capitalize(item.type[0])}</Text> */}
          <Box w="100%" ml="md">
            {/* <Text>{item.label}</Text>
            <Text color="dimmed" size="sm">
              This will accept a {item.type} input
            </Text> */}
            <Group noWrap position="apart">
              <PolymorphicFieldInput
                id={item.id}
                type={item.type as RequestFieldType}
                label={item.label}
                value={item.value}
                options={item.optionList}
                optionTooltipList={item.optionTooltipList}
                handleUpdateFieldValue={handleUpdateFieldValue}
                isRequired={item.isRequired}
              />
              <Group noWrap>
                <Tooltip label="Click to show field description">
                  <ActionIcon
                    size="xs"
                    onClick={() =>
                      showNotification({
                        title: item.label,
                        message:
                          item?.tooltip || "No tooltip added for this field",
                        color: "info",
                      })
                    }
                  >
                    <IconInfoCircle size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
                {item.type === "repeatable_section" && (
                  <>
                    <Tooltip label="Click to duplicate this section">
                      <ActionIcon
                        size="xs"
                        onClick={() => handleDuplicateSection(index)}
                      >
                        <IconPlus size={18} stroke={1.5} />
                      </ActionIcon>
                    </Tooltip>
                    <CloseButton
                      size="xs"
                      p={0}
                      m={0}
                      onClick={() => handleRemoveSection(index)}
                    />
                  </>
                )}
              </Group>
            </Group>
          </Box>
        </div>
      )}
    </Draggable>
  ));

  const handleUpdateFieldValue = (id: string, value: string): void => {
    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({ ...item, value })
    );
  };

  const handleCreateRequest = async (params: CreateRequestParams) => {
    try {
      setIsLoading(true);

      // check if form is disabled or hidden
      const fetchedForm = await getFormByTeamAndFormName(
        supabaseClient,
        teamName,
        formName
      );
      const formIsDisabled = fetchedForm[0].form_is_disabled;
      const formIsHidden = fetchedForm[0].form_is_hidden;

      if (formIsDisabled || formIsHidden || !fetchedForm)
        throw new Error("Cannot create reqeust. Form is already invalid.");
      if (fetchedForm.length === 0)
        throw new Error("Cannot create request. Form is already invalid.");

      if (!params?.title) throw new Error("No title provided");
      if (!params?.formId) throw new Error("No form provided");
      if (!params?.teamId) throw new Error("No team provided");
      if (!router.query.teamName) throw new Error("No team provided");
      if (!params?.userId) throw new Error("No requester provided");
      if (!user?.id) throw new Error("No requester provided");
      if (!params?.primaryApproverId)
        throw new Error("No primary approver provided");
      if (!params?.requestTrail) throw new Error("No approver provided");

      const requiredFields = state.filter((field) => field.isRequired);

      const requiredFieldsWithNoResponse = requiredFields.filter((field) => {
        if (field.type === "daterange") {
          return (
            (field.value as unknown as string[]) ||
            [].filter((e) => e).length < 2
          );
        }
        return !field.value;
      });
      if (requiredFieldsWithNoResponse.length > 0)
        throw new Error("Please fill in all required fields");

      if (attachment) {
        const filename = attachment.name;

        const userProfile = await getUserProfile(supabaseClient, user?.id);
        if (!userProfile?.username) throw new Error("No requester provided");

        const filepath = await uploadFile(
          supabaseClient,
          filename,
          attachment,
          "request_attachments",
          router.query.teamName as string,
          userProfile.username
        );

        params.filepathList = [filepath.path];
      }

      const createdRequest = await createRequest(supabaseClient, params);

      // add "created_by" comment
      await addComment(
        supabaseClient,
        createdRequest.request_request_table.request_id,
        user.id,
        null,
        "request_created",
        null
      );

      await router.push(`/teams/${teamName}/requests`);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: (error as Error).message,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateSection = (index: number): void => {
    const section = state[index];
    const duplicatedSection = {
      ...section,
      id: uuidv4(),
      duplicatedId: section.id,
    };

    const duplicatedItemList = [];
    let i = index;
    for (i = i + 1; i < state.length; i++) {
      const item = state[i];

      if (item.type === "section" || item.type === "repeatable_section") break;

      duplicatedItemList.push({
        ...item,
        id: uuidv4(),
        duplicatedId: section.id,
      });
    }

    const duplicatedSectionWithItemList = [
      duplicatedSection,
      ...duplicatedItemList,
    ];

    // set individual item at given position
    // const setItem = () => handlers.setItem(0, { a: 8 });
    // values -> [{ a: 8 }, { a: 7 }]
    // Reference: https://mantine.dev/hooks/use-list-state/

    // insert item at i position
    duplicatedSectionWithItemList.map((item, index) =>
      handlers.insert(index + i, item)
    );
  };

  const handleRemoveSection = (index: number): void => {
    // count number of repeatable section and prevent if only one section is left
    const repeatableSectionCount = state.filter(
      (item) => item.type === "repeatable_section"
    ).length;
    if (repeatableSectionCount === 1) {
      showNotification({
        title: "Error",
        message: "At least one repeatable section is required",
        color: "red",
      });
      return;
    }

    let i = index;
    for (i = i + 1; i < state.length; i++) {
      const item = state[i];

      if (item.type === "section" || item.type === "repeatable_section") break;

      handlers.remove(i);
    }
    handlers.remove(index);
  };

  const handleOnDrop = (files: FileWithPath[]) => {
    setAttachment(files[0]);
  };
  const handleOnReject = (fileRejections: FileRejection[]) => {
    const errorMessage = fileRejections[0].errors[0].message;
    showNotification({
      title: "Error",
      message: errorMessage,
      color: "red",
    });
  };

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        style={{ position: "fixed" }}
      />
      <Text size="xl" mb="xl" weight="bolder">
        Submit form for approval
      </Text>
      <Container
        className={classes.container}
        style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
      >
        <Group position="left" noWrap mb="xl">
          <Text size="xl">{formName}</Text>
        </Group>
        {/* <Group position="left" noWrap mb="xl"> */}
        <TextInput
          size="md"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          placeholder="Enter request title"
          required
          withAsterisk
          label="Title"
          mb="xl"
        />
        {/* </Group> */}
        {/* <Group position="left" noWrap mb="xl"> */}
        {/* <Text>Description</Text> */}
        <Textarea
          size="sm"
          value={description}
          placeholder="Tell us more about your request"
          onChange={(event) => setDescription(event.currentTarget.value)}
          mb="xl"
          label="Description"
          minRows={4}
        />
        <Divider />
        {/* </Group> */}
        <Group position="left" mt="xl" mb="md">
          <Text>Fields</Text>
        </Group>
        <DragDropContext
          onDragEnd={({ destination, source }) =>
            handlers.reorder({
              from: source.index,
              to: destination?.index || 0,
            })
          }
        >
          <Droppable droppableId="dnd-list" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Divider mt="xl" />

        <Group position="left" my="xl">
          <Text>Upload attachment</Text>
        </Group>

        <RequestDropzone
          onDrop={handleOnDrop}
          onReject={handleOnReject}
          attachment={attachment}
          setAttachment={setAttachment}
        />
        {/* show clear attachment button */}
        {attachment && (
          <Group noWrap position="right">
            <Button
              variant="outline"
              color="red"
              onClick={() => setAttachment(null)}
              mt="md"
            >
              Clear attachment
            </Button>
          </Group>
        )}

        <Divider mt="xl" />

        <Group position="left" my="xl">
          <Text>Signers</Text>
        </Group>
        {/* <Stepper active={requestTrail.length + 1} orientation="vertical">
          {requestTrail.map((trail, index) => {
            const { approverUsername, approverActionName } = trail;
            return (
              <Stepper.Step
                key={index}
                label={`Step ${index + 1}`}
                description={`Will be ${approverActionName} by ${approverUsername}`}
              />
            );
          })}
        </Stepper> */}

        <List
          spacing="xs"
          size="sm"
          mb="xl"
          center
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconCircleDashed size={16} />
            </ThemeIcon>
          }
        >
          {requestTrail.map((trail, index) => {
            const { approverUsername, approverActionName } = trail;
            return (
              <Group noWrap mt="xs" key={index}>
                <List.Item
                >{`Will be ${approverActionName} by ${approverUsername}`}</List.Item>
                {trail.isPrimaryApprover && <Badge>Primary Approver</Badge>}
              </Group>
            );
          })}
        </List>
        <Container size="sm" p={0} mt="xl">
          <Group position="center" p={0}>
            <Button
              onClick={() =>
                handleCreateRequest({
                  formId,
                  userId: user?.id as string,
                  description,
                  requestTrail,
                  dndList: state,
                  teamId,
                  title,
                  primaryApproverId: primaryApproverId || "",
                })
              }
              size="md"
            >
              Submit form for approval
            </Button>
          </Group>
        </Container>
      </Container>
    </>
  );
};

export default CreateRequestPage;

CreateRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
