import Layout from "@/components/Layout/Layout";
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
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

import {
  createRequest,
  CreateRequestParams,
  getFormApprovers,
  getFormByTeamAndFormName,
} from "@/utils/queries";
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
  }[];
};

export type RequestTrail = {
  data: {
    approverId: string;
    approverUsername: string;
    approverAction: string;
  }[];
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  resetServerContext();

  const supabaseClient = createServerSupabaseClient(ctx);

  if (!ctx.query.teamName || !ctx.query.form) {
    return {
      redirect: {
        destination: "/400",
        permanent: false,
      },
    };
  }

  const form = await getFormByTeamAndFormName(
    supabaseClient,
    ctx.query.teamName as string,
    ctx.query.form as string
  );

  if (form.length === 0) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const formApprovers = await getFormApprovers(
    supabaseClient,
    form[0].form_id as number
  );

  // Transform to DndListHandleProps and RequestTrail so frontend can handle data easier.
  const dndList: DndListHandleProps = {
    data: form.map((form) => ({
      id: (form.field_id as number).toString(),
      type: form.request_field_type as string,
      label: form.field_name as string,
    })),
  };

  const trail: RequestTrail = {
    data: formApprovers.map((formApprover) => {
      return {
        approverId: formApprover.user_id as string,
        approverAction: formApprover.form_approver_action_id as string,
        approverUsername: formApprover.username as string,
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
  const formName = form[0].form_name as string;
  const formId = form[0].form_id as number;
  const teamId = form[0].team_id as string;
  const teamName = form[0].team_name as string;
  const orderId = form[0].order_id as number;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responseList, setResponseList] = useState<
    CreateRequestParams["responseList"]
  >(
    form.map((form) => ({
      fieldId: form.field_id as number,
      responseValue: "",
    }))
  );

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

  const handleCreateRequest = async (params: CreateRequestParams) => {
    try {
      setIsLoading(true);
      await createRequest(supabaseClient, params);
      await router.push(`/teams/${teamName}/requests/create?form=${formName}`);
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
        <Stepper active={requestTrail.length + 1} orientation="vertical">
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

        <Container size="sm" p={0} mt="lg">
          <Group position="center" p={0}>
            <Button
              onClick={() =>
                handleCreateRequest({
                  formId,
                  userId: user?.id as string,
                  description,
                  requestTrail,
                  responseList,
                  teamId,
                  title,
                  orderId,
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
