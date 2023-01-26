import {
  Button,
  Container,
  createStyles,
  Group,
  LoadingOverlay,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconGripVertical } from "@tabler/icons";
import { capitalize, startCase } from "lodash";
import { useRouter } from "next/router";
import {
  DndListHandleProps,
  RequestTrail,
} from "pages/teams/[teamName]/requests/create";
import { useEffect, useState } from "react";

import {
  approveRequest,
  CreateRequestParams,
  GetRequest,
} from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export type RequestProps = {
  request: GetRequest;
  dndList: DndListHandleProps;
  trail: RequestTrail;
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

function Request({ request, dndList, trail }: RequestProps) {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState<DndListHandleProps["data"][0]>(
    dndList.data
  );
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const user = useUser();
  const unsorted = trail.data as (RequestTrail["data"][0] & {
    signed: boolean;
  })[];
  // sort unsorted and put all unosrted.signed === true at the start of array.
  const requestTrail = unsorted.sort((a, b) => {
    if (a.signed === b.signed) {
      return 0;
    }
    if (a.signed) {
      return -1;
    }
    return 1;
  });

  const [lastSignedIndex, setLastSignedIndex] = useState(0);

  const formName = request[0].form_name as string;
  const formId = request[0].form_id as number;
  const teamId = request[0].team_id as string;
  const teamName = request[0].team_name as string;
  const orderId = request[0].order_id as number;
  const requestId = request[0].request_id as number;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responseList, setResponseList] = useState<
    CreateRequestParams["responseList"]
  >(
    request.map((field) => ({
      fieldId: field.field_id as number,
      responseValue: "",
    }))
  );

  const isCurrentUserApprover = requestTrail.find(
    (item) => item.approverId === user?.id
  );
  const [signed, setSigned] = useState<boolean>();

  const items = state.map((item, index) => (
    // Original
    // <Draggable key={item.type} index={index} draggableId={item.type}>
    <Draggable key={item.id} index={index} draggableId={item.id}>
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
          <Text className={classes.type}>{capitalize(item.type[0])}</Text>
          <div>
            <Text>{item.label}</Text>
            <Text color="dimmed" size="sm">
              This will accept a {item.type} input
            </Text>
          </div>
        </div>
      )}
    </Draggable>
  ));

  useEffect(() => {
    setSigned(isCurrentUserApprover?.signed);
  }, [isCurrentUserApprover?.signed]);

  useEffect(() => {
    // find index of the last element with requestTrail.signed === true
    let foundLastSignedIndex = requestTrail.findIndex((item) => item.signed);
    foundLastSignedIndex = requestTrail.every((item) => item.signed)
      ? requestTrail.length
      : lastSignedIndex;

    setLastSignedIndex(foundLastSignedIndex);
  }, []);

  const handleApproveRequest = async (
    userId: string,
    requestId: number,
    actionId: string
  ) => {
    try {
      setIsLoading(true);
      await approveRequest(supabaseClient, userId, requestId, actionId);
      setSigned(true);
      setLastSignedIndex((prev) => prev + 1);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
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
          <Text size="xl">{startCase(formName)}</Text>
        </Group>
        <Group position="left" noWrap mb="xl">
          <Text>Title</Text>
          <TextInput
            size="md"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </Group>
        <Group position="left" noWrap mb="xl">
          <Text>Description</Text>
          <TextInput
            size="md"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </Group>
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
        <Group position="left" mb="xl">
          <Text>Signers</Text>
        </Group>
        <Stepper active={lastSignedIndex + 1} orientation="vertical">
          {requestTrail.map((trail, index) => {
            const { approverUsername, approverAction } = trail;
            return (
              <Stepper.Step
                key={index}
                label={`Step ${index + 1}`}
                description={`Will be ${approverAction} by ${approverUsername}`}
              />
            );
          })}
        </Stepper>
        {isCurrentUserApprover && !signed && (
          <Container size="sm" p={0} mt="lg">
            <Group position="center" p={0}>
              <Button
                onClick={() =>
                  handleApproveRequest(
                    isCurrentUserApprover.approverId,
                    requestId,
                    isCurrentUserApprover.approverAction
                  )
                }
                size="md"
              >
                {`Sign as ${isCurrentUserApprover.approverAction}`}
              </Button>
            </Group>
          </Container>
        )}
        {isCurrentUserApprover && signed && (
          <Container size="sm" p={0} mt="lg">
            <Group position="center" p={0}>
              <Button size="md" color="green">
                {`Signed as ${isCurrentUserApprover.approverAction}`}
              </Button>
            </Group>
          </Container>
        )}
      </Container>
    </>
  );
}

export default Request;
