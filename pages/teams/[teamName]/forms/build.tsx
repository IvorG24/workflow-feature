import Layout from "@/components/Layout/Layout";
import {
  createForm,
  createFormApproverList,
  getTeam,
  getUserProfileByUsername,
} from "@/utils/queries";
import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Group,
  LoadingOverlay,
  Select,
  Stepper,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconGripVertical, IconPlus } from "@tabler/icons";
import { capitalize, toLower } from "lodash";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import useFetchTeamMemberList from "@/hooks/useFetchTeamMemberList";
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

export const getServerSideProps = async () => {
  resetServerContext();

  return { props: {} };
};

const BuildFormPage: NextPageWithLayout = () => {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState<DndListHandleProps["data"][0]>([]);
  const [newInputFieldType, setNewInputFieldType] = useState("");
  const [newInputFieldLabel, setNewInputFieldLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const user = useUser();
  const [formName, setFormName] = useState("");
  const [requestTrail, setRequestTrail] = useState<RequestTrail["data"]>([]);
  const [newSignerUsername, setNewSignerUsername] = useState("");
  const [newSignerAction, setNewSignerAction] = useState("");
  const { isFetching, teamMemberList } = useFetchTeamMemberList(
    router.query.teamName as string
  );

  const handleAppend = (item: DndListHandleProps["data"][0]) =>
    handlers.append(item);

  const handleAddSection = () => {
    handleAppend({
      id: uuidv4(),
      type: "section",
      label: "Section",
    });
  };

  const handleSaveForm = async (
    userId: string,
    teamName: string,
    formName: string,
    fieldList: DndListHandleProps["data"],
    requestTrail: RequestTrail["data"]
  ) => {
    try {
      setIsLoading(true);
      if (!userId) throw new Error("User not found");
      if (!router.query.teamName) throw new Error("No active team");

      const team = await getTeam(supabaseClient, teamName);

      if (!team) throw new Error("Team not found");

      const createdForm = await createForm(
        supabaseClient,
        { form_name: toLower(formName) },
        fieldList,
        team.team_id,
        userId
      );

      // insert to
      // insert to request_form_approver_table

      await createFormApproverList(
        supabaseClient,
        createdForm.request_form_table.form_id,
        requestTrail
      );

      await router.push("/");

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

  const handleAddSigner = async (
    signerUsername: string,
    signerAction: string
  ) => {
    try {
      const userProfile = await getUserProfileByUsername(
        supabaseClient,
        signerUsername
      );

      if (!userProfile) throw new Error("User not found");

      setRequestTrail((prev) => [
        ...prev,
        {
          approverId: userProfile.user_id as string,
          approverUsername: userProfile.username as string,
          approverAction: signerAction,
        },
      ]);
      setNewSignerUsername("");
      setNewSignerAction("");
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

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

  return (
    <>
      <LoadingOverlay
        visible={isLoading || isFetching}
        overlayBlur={2}
        style={{ position: "fixed" }}
      />
      <Text size="xl" mb="xl" weight="bolder">
        Build Form
      </Text>
      <Container
        className={classes.container}
        style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
      >
        <Group position="left" noWrap mb="xl">
          <Text>Form Name</Text>
          <TextInput
            size="md"
            value={formName}
            onChange={(event) => setFormName(event.currentTarget.value)}
          />
        </Group>
        <Group position="left" mb="xl">
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
        <div className={classes.add}>
          <Container size="lg">
            <Group position="center" noWrap={false}>
              <Select
                size="sm"
                placeholder="Type"
                onChange={(type) => setNewInputFieldType(type || "")}
                value={newInputFieldType}
                data={[
                  { value: "text", label: "Text" },
                  { value: "number", label: "Number" },
                  { value: "date", label: "Date" },
                ]}
              />
              <TextInput
                placeholder="Label"
                size="sm"
                value={newInputFieldLabel}
                onChange={(event) =>
                  setNewInputFieldLabel(event.currentTarget.value)
                }
              />
              <Tooltip label="Add field">
                <ActionIcon
                  variant="outline"
                  size="md"
                  onClick={() =>
                    handleAppend({
                      id: uuidv4(),
                      label: newInputFieldLabel,
                      type: newInputFieldType,
                    })
                  }
                >
                  <IconPlus size={18} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <Button onClick={handleAddSection} size="sm">
                Add Section
              </Button>
            </Group>
          </Container>
        </div>

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

        <Group position="center" noWrap>
          <Select
            size="sm"
            placeholder="Signer"
            onChange={(username) => setNewSignerUsername(username || "")}
            value={newSignerUsername}
            // data={[
            //   { value: "text", label: "Text" },
            //   { value: "number", label: "Number" },
            //   { value: "date", label: "Date" },
            // ]}
            data={teamMemberList.map((member) => ({
              value: member.username as string,
              label: member.username as string,
            }))}
          />
          <TextInput
            placeholder="Action"
            size="sm"
            value={newSignerAction}
            onChange={(event) => setNewSignerAction(event.currentTarget.value)}
          />
          <Button
            onClick={() => handleAddSigner(newSignerUsername, newSignerAction)}
            size="sm"
          >
            Add Signer
          </Button>
        </Group>

        <Container size="sm" p={0} mt="lg">
          <Group position="center" p={0}>
            <Button
              onClick={() =>
                handleSaveForm(
                  user?.id as string,
                  router.query.teamName as string,
                  formName,
                  state,
                  requestTrail
                )
              }
              size="md"
            >
              Save form
            </Button>
          </Group>
        </Container>
      </Container>
    </>
  );
};

export default BuildFormPage;

BuildFormPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
