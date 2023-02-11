import {
  ActionIcon,
  Badge,
  Box,
  Button,
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
import { useListState, useToggle } from "@mantine/hooks";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleMinus,
  IconDownload,
  IconGripVertical,
  IconInfoCircle,
} from "@tabler/icons";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { getFileUrl } from "@/utils/file";
import {
  addComment,
  getCommentList,
  GetCommentList,
  getRequest,
  GetRequest,
  updateRequestCancelStatus,
  updateRequestStatus,
} from "@/utils/queries";
import { RequestFieldType, RequestStatus } from "@/utils/types";
import { showNotification } from "@mantine/notifications";
import {
  DndListHandleProps,
  RequestTrail,
} from "pages/teams/[teamName]/requests/[requestId]";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import PolymorphicFieldInput from "../BuildFormPage/PolymorphicFieldInput";
import AttachmentBox, { AttachmentBoxProps } from "./AttachmentBox";

export type RequestProps = {
  request: GetRequest;
  dndList: DndListHandleProps;
  trail: RequestTrail;
  setCommentList: Dispatch<SetStateAction<GetCommentList>>;
  setIsFetchingCommentList: Dispatch<SetStateAction<boolean>>;
};

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

function Request({ request, dndList, trail, setCommentList }: RequestProps) {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState<DndListHandleProps["data"][0]>(
    dndList.data
  );
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const [requestTrail, requestTrailHandler] = useListState([...trail.data]);

  const [noApproved, setNoApproved] = useState(false);

  const [lastSignedIndex, setLastSignedIndex] = useState(0);

  const [mainStatus, setMainStatus] = useState("pending");

  const [attachmentList, setAttachmentList] = useState<AttachmentBoxProps[]>(
    []
  );

  const title = request[0].request_title as string;
  const description = request[0].request_description as string;
  const formName = request[0].form_name as string;

  const requestId = request[0].request_id as number;
  const canceled = !!request[0].request_is_canceled;
  const primaryApproverId = trail.data.find(
    (item) => item.isPrimaryApprover
  )?.approverId;

  const isCurrentUserApprover = trail.data.find(
    (item) => item.approverId === user?.id
  );
  const isCurrentUserRequester = request[0].user_id === user?.id;
  const [isCanceled, toggleIsCanceled] = useToggle();
  // const [isSignedByCurrentUser, setIsSignedByCurrentUser] = useState<boolean>();
  const [
    currentUserApproverActionStatusId,
    setCurrentUserApproverActionStatusId,
  ] = useState<RequestStatus>("pending");
  const [updateStatusComment, setUpdateStatusComment] = useState("");

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
            {/* <PolymorphicFieldInput
              id={item.id}
              type={item.type as RequestFieldType}
              label={item.label}
              value={item.value}
              options={item.optionList}
              optionTooltipList={item.optionTooltipList}
            /> */}
            <Group noWrap position="apart">
              <PolymorphicFieldInput
                id={item.id}
                type={item.type as RequestFieldType}
                label={item.label}
                value={item.value}
                options={item.optionList}
                optionTooltipList={item.optionTooltipList}
                isRequired={item.isRequired}
                isDisabled={item.isDisabled}
              />
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
            </Group>
          </Box>
        </div>
      )}
    </Draggable>
  ));

  useEffect(() => {
    setMainStatus(request[0].form_fact_request_status_id as RequestStatus);
  }, [request[0].form_fact_request_status_id]);

  useEffect(() => {
    setCurrentUserApproverActionStatusId(
      isCurrentUserApprover?.approverActionStatusId as RequestStatus
    );
  }, [isCurrentUserApprover?.approverActionStatusId]);

  useEffect(() => {
    toggleIsCanceled(canceled);
  }, [canceled]);

  useEffect(() => {
    let foundLastSignedIndex = trail.data.findIndex(
      (item) => item.approverActionStatusId !== "pending"
    );
    foundLastSignedIndex = trail.data.every(
      (item) => item.approverActionStatusId !== "pending"
    )
      ? trail.data.length
      : lastSignedIndex;

    setLastSignedIndex(foundLastSignedIndex);

    const foundNoApprovedOrRejected =
      trail.data.filter((trail) => trail.approverActionStatusId !== "pending")
        .length === 0;
    setNoApproved(foundNoApprovedOrRejected);
  }, []);

  useEffect(() => {
    (async () => {
      const filepathList = request[0].request_attachment_filepath_list || [];

      const fileUrlListPromises = filepathList.map((attachment) => {
        return getFileUrl(supabaseClient, attachment, "request_attachments");
      });

      const fileUrlList = (await Promise.all(fileUrlListPromises)) || [];

      // * Archived
      // const fileSizeListPromises = fileUrlList.map((fileUrl) => {
      //   return getFileSize(fileUrl);
      // });

      // const fileSizeList = (await Promise.all(fileSizeListPromises)) || [];

      const attachmentList: AttachmentBoxProps[] =
        filepathList.map((attachment, index) => ({
          filename: attachment.split("?")[3],
          fileUrl: fileUrlList[index],
          fileType: attachment.split(".").pop() || "",
          // * Archived
          // fileSize: fileSizeList[index].toString(),
          fileSize: "",
        })) || [];

      setAttachmentList(attachmentList);
    })();
  }, [request[0].request_attachment_filepath_list]);

  const handleUpdateStatus = async (
    userId: string,
    requestId: number,
    actionId: string,
    newStatus: RequestStatus,
    primaryApproverId: string
  ) => {
    try {
      setIsLoading(true);

      // check if request is canceled already from the server
      const request = await getRequest(supabaseClient, requestId);

      if (request[0].request_is_canceled) {
        showNotification({
          message: "Request is already canceled. Kindly refresh the page.",
          color: "red",
        });
        return;
      }

      const isUpdatedByPrimaryApprover = userId === primaryApproverId;
      await updateRequestStatus(
        supabaseClient,
        userId,
        requestId,
        actionId,
        newStatus,
        isUpdatedByPrimaryApprover,
        updateStatusComment || null
      );
      // setIsSignedByCurrentUser(true);
      setLastSignedIndex((prev) => (noApproved ? prev : prev + 1));
      setNoApproved(false);
      setCurrentUserApproverActionStatusId(newStatus);
      setMainStatus((prev) => {
        if (userId === primaryApproverId) return newStatus;
        else return prev;
      });
      requestTrailHandler.applyWhere(
        (trail) => trail.approverId === userId,
        (trail) => ({ ...trail, approverActionStatusId: newStatus })
      );

      // create approve or reject comment on the request then update the comment list
      await addComment(
        supabaseClient,
        requestId,
        userId,
        updateStatusComment || null,
        newStatus === "approved" ? "approved" : "rejected",
        null
      );

      const commentList = await getCommentList(supabaseClient, requestId);
      setCommentList(commentList);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (
    requestId: number,
    isCanceled: boolean,
    userId: string
  ) => {
    try {
      setIsLoading(true);

      // check if the request is already canceled, approved, or rejected
      const request = await getRequest(supabaseClient, requestId);
      if (request[0].form_fact_request_status_id !== "pending") {
        showNotification({
          message:
            "Request is already approved or rejected. Kindly refresh the page.",
          color: "red",
        });
        setIsLoading(false);
        return;
      }
      if (request[0].request_is_canceled) {
        showNotification({
          message: "Request is already canceled. Kindly refresh the page.",
          color: "red",
        });
        setIsLoading(false);
        return;
      }

      await updateRequestCancelStatus(supabaseClient, requestId, isCanceled);

      const commentType = isCanceled ? "canceled" : "uncanceled";

      await addComment(
        supabaseClient,
        requestId,
        userId,
        null,
        commentType,
        null
      );

      toggleIsCanceled(isCanceled);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleExportRequestReceipt = async () => {
    alert("handleExportRequestReceipt");
  };

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        style={{ position: "fixed" }}
      />
      <Text size="xl" mb="xl" weight="bolder">
        Request
      </Text>
      <Container
        className={classes.container}
        style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
      >
        <Group position="apart" noWrap mb="xl">
          <Text size="xl">{formName}</Text>
          <Tooltip multiline label="Export request receipt">
            <ActionIcon
              variant="default"
              disabled={mainStatus !== "approved"}
              onClick={handleExportRequestReceipt}
            >
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
        {/* <Group position="left" noWrap mb="xl"> */}
        {/* <Text>Title</Text> */}
        <TextInput size="md" value={title} disabled label="Title" mb="xl" />
        {/* </Group> */}
        {/* <Group position="left" noWrap mb="xl"> */}
        {/* <Text>Description</Text> */}
        <Textarea
          size="sm"
          value={description}
          minRows={4}
          disabled
          label="Description"
          mb="xl"
        />
        {/* </Group> */}
        <Divider />

        <Group position="left" mt="xl" mb="xl">
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
          <Text>Attachments</Text>
        </Group>
        {attachmentList.map((attachment, index) => (
          <AttachmentBox key={index} {...attachment} />
        ))}
        {attachmentList.length === 0 && (
          <Text size="sm" color="gray">
            No attachments
          </Text>
        )}

        <Divider mt="xl" />

        <Group position="left" my="xl">
          <Text>Signers</Text>
        </Group>
        {/* <Stepper
          active={noApproved ? 0 : lastSignedIndex + 1}
          orientation="vertical"
        >
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
          center
          mb="xl"
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconCircleDashed size={16} />
            </ThemeIcon>
          }
        >
          {requestTrail.map((trail, index) => {
            const { approverUsername, approverActionName } = trail;
            if (trail.approverActionStatusId === "approved") {
              return (
                <Group noWrap mt="xs" key={index}>
                  <List.Item
                    icon={
                      <ThemeIcon color="teal" size={24} radius="xl">
                        <IconCircleCheck size={16} />
                      </ThemeIcon>
                    }
                  >{`Signed as ${approverActionName} by ${approverUsername}`}</List.Item>
                  {trail.isPrimaryApprover && <Badge>Primary Approver</Badge>}
                </Group>
              );
            } else if (trail.approverActionStatusId === "rejected") {
              return (
                <Group noWrap mt="xs" key={index}>
                  <List.Item
                    icon={
                      <ThemeIcon color="red" size={24} radius="xl">
                        <IconCircleMinus size={16} />
                      </ThemeIcon>
                    }
                  >{`Rejected by ${approverUsername}`}</List.Item>
                  {trail.isPrimaryApprover && <Badge>Primary Approver</Badge>}
                </Group>
              );
            } else {
              return (
                <Group noWrap mt="xs" key={index}>
                  <List.Item>{`Will be ${approverActionName} by ${approverUsername}`}</List.Item>
                  {trail.isPrimaryApprover && <Badge>Primary Approver</Badge>}
                </Group>
              );
            }
          })}
        </List>

        {isCurrentUserApprover &&
          currentUserApproverActionStatusId === "pending" &&
          !isCanceled && (
            <Textarea
              placeholder="You can leave a comment with your approval or rejection"
              value={updateStatusComment}
              mt="xl"
              onChange={(e) => setUpdateStatusComment(e.currentTarget.value)}
              disabled={
                isCurrentUserApprover &&
                currentUserApproverActionStatusId !== "pending"
              }
            />
          )}

        {isCurrentUserApprover &&
          currentUserApproverActionStatusId === "pending" &&
          !isCanceled && (
            <Container size="sm" p={0} mt="lg">
              <Group position="right" p={0}>
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      isCurrentUserApprover.approverId,
                      requestId,
                      isCurrentUserApprover.approverActionId,
                      "approved",
                      primaryApproverId as string
                    )
                  }
                  size="md"
                  color="green"
                >
                  {`Sign as ${isCurrentUserApprover.approverActionName} with comment`}
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      isCurrentUserApprover.approverId,
                      requestId,
                      isCurrentUserApprover.approverActionId,
                      "rejected",
                      primaryApproverId as string
                    )
                  }
                  size="md"
                  color="red"
                >
                  {"Reject"}
                </Button>
              </Group>
            </Container>
          )}
        {isCurrentUserApprover &&
          currentUserApproverActionStatusId !== "pending" && (
            <Container size="sm" p={0} mt="lg">
              <Group position="right" p={0}>
                {currentUserApproverActionStatusId === "approved" && (
                  <Button size="md" disabled>
                    {`You signed this request as ${isCurrentUserApprover.approverActionName}`}
                  </Button>
                )}
                {currentUserApproverActionStatusId === "rejected" && (
                  <Button size="md" color="red" disabled>
                    {`You rejected this request`}
                  </Button>
                )}
              </Group>
            </Container>
          )}
        {isCurrentUserRequester && mainStatus === "pending" && !isCanceled && (
          <Container size="sm" p={0} mt="lg">
            <Group position="right" p={0}>
              <Button
                size="md"
                // color="dark"
                variant="outline"
                onClick={() => handleCancelRequest(requestId, true, user.id)}
              >
                Cancel Request
              </Button>
            </Group>
          </Container>
        )}
        {isCurrentUserRequester && isCanceled && (
          <Container size="sm" p={0} mt="lg">
            <Group position="right" p={0}>
              <Button
                size="md"
                color="dark"
                // onClick={() => handleCancelRequest(requestId, false, user.id)}
                disabled
              >
                Canceled
              </Button>
            </Group>
          </Container>
        )}
        {isCurrentUserRequester && mainStatus === "approved" && !isCanceled && (
          <Container size="sm" p={0} mt="lg">
            <Group position="right" p={0}>
              <Button size="md" disabled>
                Approved
              </Button>
            </Group>
          </Container>
        )}
        {isCurrentUserRequester && mainStatus === "rejected" && !isCanceled && (
          <Container size="sm" p={0} mt="lg">
            <Group position="right" p={0}>
              <Button size="md" disabled>
                Rejected
              </Button>
            </Group>
          </Container>
        )}
      </Container>
    </>
  );
}

export default Request;
