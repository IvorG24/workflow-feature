import Layout from "@/components/Layout/Layout";
import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Group,
  LoadingOverlay,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconGripVertical, IconPlus } from "@tabler/icons";
import { capitalize } from "lodash";
import { NextPageWithLayout } from "pages/_app";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const useStyles = createStyles((theme) => ({
  item: {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
    paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    marginBottom: theme.spacing.sm,
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
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
}));

interface DndListHandleProps {
  data: {
    type: string;
    label: string;
  }[];
}

const BuildFormPage: NextPageWithLayout = () => {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState<DndListHandleProps["data"][0]>([]);
  const [newInputFieldType, setNewInputFieldType] = useState("");
  const [newInputFieldLabel, setNewInputFieldLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAppend = (item: DndListHandleProps["data"][0]) =>
    handlers.append(item);

  const handleSaveForm = async () => {
    try {
      setIsLoading(true);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    console.log(JSON.stringify(state, null, 2));
  };

  const items = state.map((item, index) => (
    // Original
    // <Draggable key={item.type} index={index} draggableId={item.type}>
    <Draggable key={index} index={index} draggableId={item.type}>
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
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <DragDropContext
        onDragEnd={({ destination, source }) =>
          handlers.reorder({ from: source.index, to: destination?.index || 0 })
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

        <div className={classes.add}>
          <Container size="lg">
            <Group position="center" noWrap>
              <Select
                size="sm"
                placeholder="Select input field type"
                onChange={(type) => setNewInputFieldType(type || "")}
                value={newInputFieldType}
                data={[
                  { value: "text", label: "Text" },
                  { value: "number", label: "Number" },
                  { value: "date", label: "Date" },
                  { value: "email", label: "Email" },
                ]}
              />
              <TextInput
                size="sm"
                value={newInputFieldLabel}
                onChange={(event) =>
                  setNewInputFieldLabel(event.currentTarget.value)
                }
              />
              {/* <Button
              variant="subtle"
              onClick={() =>
                handleAppend({
                  label: newInputFieldLabel,
                  type: newInputFieldType,
                })
              }
              size="md"
              leftIcon={<IconPlus size={14} />}
            >
              Add input field
            </Button> */}
              <ActionIcon
                variant="outline"
                size="md"
                onClick={() =>
                  handleAppend({
                    label: newInputFieldLabel,
                    type: newInputFieldType,
                  })
                }
              >
                <IconPlus size={18} stroke={1.5} />
              </ActionIcon>
            </Group>
            {/* <Group position="center">
            <Button
              onClick={() =>
                handleAppend({
                  label: newInputFieldLabel,
                  type: newInputFieldType,
                })
              }
              size="md"
            >
              Save form
            </Button>
          </Group> */}
          </Container>
        </div>
        <div className={classes.add}>
          <Container size="sm" p={0}>
            <Group position="center" p={0}>
              <Button onClick={() => handleSaveForm()} size="md">
                Save form
              </Button>
            </Group>
          </Container>
        </div>
      </DragDropContext>
    </>
  );
};

export default BuildFormPage;

BuildFormPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
