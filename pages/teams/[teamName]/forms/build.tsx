import Layout from "@/components/Layout/Layout";
import {
  createForm,
  createFormApproverList,
  getTeam,
  getTeamFormTemplateNameList,
  getTeamMember,
  getUserProfileByUsername,
} from "@/utils/queries";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CloseButton,
  Container,
  createStyles,
  Divider,
  Group,
  List,
  LoadingOverlay,
  Select,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconCircleDashed,
  IconGripVertical,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons";
import { startCase, toLower } from "lodash";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import PolymorphicFieldInput from "@/components/BuildFormPage/PolymorphicFieldInput";
import useFetchTeamMemberList from "@/hooks/useFetchTeamMemberList";
import { RequestFieldType, requestFieldTypeList } from "@/utils/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
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
    optionList?: string[];
    optionTooltipList?: string[];

    newOption?: string;
    newOptionTooltip?: string;
    isRequired?: boolean;
    tooltip?: string;
  }[];
};

export type RequestTrail = {
  data: {
    approverId: string;
    approverUsername: string;
    approverActionName: string;
  }[];
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  resetServerContext();

  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const teamName = `${ctx.query?.teamName}`;

  const user = session?.user;

  const currentUserTeamInfo = await getTeamMember(
    supabaseClient,
    teamName,
    user.id
  );

  // if current user is not admin, prevent from creating a form
  if (currentUserTeamInfo?.member_role_id === "member") {
    return {
      redirect: {
        destination: "/403",
        permanent: false,
      },
    };
  }

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
  // const [requestTrail, setRequestTrail] = useState<RequestTrail["data"]>([]);

  const [requestTrail, requestTrailHandler] = useListState<
    RequestTrail["data"][0]
  >([]);
  const [primaryApproverId, setPrimaryApproverId] = useState("");
  const [newSignerUsername, setNewSignerUsername] = useState("");
  const [newSignerAction, setNewSignerAction] = useState("");
  const { teamMemberList } = useFetchTeamMemberList(
    router.query.teamName as string
  );

  const handleAppend = (item: DndListHandleProps["data"][0]) => {
    // check if item keys are empty is empty
    const { id, type, label } = item;
    if (!id || !type || !label) {
      showNotification({
        title: "Error",
        message: "Please fill in field type and label",
        color: "red",
        autoClose: 3000,
      });

      return;
    }

    handlers.append(item);
    setNewInputFieldType("");
    setNewInputFieldLabel("");
  };

  // const handleAddSection = () => {
  //   handleAppend({
  //     id: uuidv4(),
  //     type: "section",
  //     label: "Section",
  //   });
  // };

  const handleSaveForm = async (
    userId: string,
    teamName: string,
    formName: string,
    fieldList: DndListHandleProps["data"],
    requestTrail: RequestTrail["data"],
    primaryApproverId: string
  ) => {
    try {
      setIsLoading(true);

      if (!userId) throw new Error("User not found");
      if (!teamName) throw new Error("No active team");

      // check if form name is empty
      if (!formName) throw new Error("Form name is empty");

      // check if fieldList is empty
      if (fieldList.length === 0) throw new Error("No field added");

      // check if primary approver is empty
      if (!primaryApproverId) throw new Error("No primary approver selected");
      // check primary approver from requestTrail
      const primaryApprover = requestTrail.find(
        (approver) => approver.approverId === primaryApproverId
      );
      if (!primaryApprover) throw new Error("No primary approver selected");

      // check if requestTrail is empty
      if (requestTrail.length === 0) throw new Error("No approver added");

      // check if form name already exists for the team
      const teamFormTemplateNameList = await getTeamFormTemplateNameList(
        supabaseClient,
        teamName
      );
      if (
        teamFormTemplateNameList
          .map((formTemplate) => formTemplate.form_name)
          .includes(formName)
      )
        throw new Error("Form name already exists");

      // check if there are empty options in select and multi-select fields
      const emptyOptionFieldList = fieldList.filter(
        (field) => field.type === "select" || field.type === "multiple"
      );
      if (emptyOptionFieldList.length > 0) {
        const emptyOptionField = emptyOptionFieldList.find(
          (field) => !field?.optionList || field.optionList.length === 0
        );
        if (emptyOptionField) throw new Error("Empty option field found");
      }

      const team = await getTeam(supabaseClient, teamName);

      if (!team) throw new Error("Team not found");

      const createdForm = await createForm(
        supabaseClient,
        { form_name: formName },
        fieldList,
        team.team_id,
        userId
      );

      await createFormApproverList(
        supabaseClient,
        createdForm.request_form_table.form_id,
        requestTrail,
        primaryApproverId
      );

      await router.push(`/teams/${teamName}/forms`);

      setIsLoading(false);
      router.reload();
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

  const handleAddSigner = async (
    signerUsername: string,
    signerAction: string
  ) => {
    try {
      if (!signerUsername || !signerAction) {
        showNotification({
          title: "Error",
          message: "Please fill in signer username and action",
          color: "red",
          autoClose: 3000,
        });
        return;
      }

      const userProfile = await getUserProfileByUsername(
        supabaseClient,
        signerUsername
      );

      if (!userProfile) throw new Error("User not found");

      // setRequestTrail((prev) => [
      //   ...prev,
      //   {
      //     approverId: userProfile.user_id as string,
      //     approverUsername: userProfile.username as string,
      //     approverActionName: signerAction,
      //   },
      // ]);

      requestTrailHandler.append({
        approverId: userProfile.user_id as string,
        approverUsername: userProfile.username as string,
        approverActionName: signerAction,
      });

      if (requestTrail.length === 0)
        setPrimaryApproverId(userProfile.user_id as string);

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

  const handleRemoveSigner = async (index: number) => {
    requestTrailHandler.remove(index);
  };

  const handleAddOption = (
    id: string,
    option: string,
    optionTooltip: string
  ) => {
    if (!id || !option) {
      showNotification({
        title: "Error",
        message: "Option cannot be empty",
        color: "red",
        autoClose: 3000,
      });
      return;
    }

    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({
        ...item,
        newOption: "",
        newOptionTooltip: "",
        optionList: [...(item.optionList || []), option],
        optionTooltipList: [...(item.optionTooltipList || []), optionTooltip],
      })
    );
    showNotification({
      title: "Success",
      message: "Option added",
      color: "green",
      autoClose: 3000,
    });
  };

  const handleOptionChange = (id: string, option: string) => {
    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({
        ...item,
        newOption: option,
      })
    );
  };

  const handleToggleIsRequired = (id: string, value: boolean) => {
    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({
        ...item,
        isRequired: value,
      })
    );
  };

  const handleUpdateFieldTooltip = (id: string, tooltip: string) => {
    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({
        ...item,
        tooltip,
      })
    );
  };

  const handleOptionTooltipChange = (id: string, tooltip: string) => {
    handlers.applyWhere(
      (item) => item.id === id,
      (item) => ({
        ...item,
        newOptionTooltip: tooltip,
      })
    );
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
          {/* <Text className={classes.type}>{capitalize(item.type[0])}</Text> */}
          <Box w="100%" ml="md">
            <Group noWrap position="apart">
              <PolymorphicFieldInput
                id={item.id}
                type={item.type as RequestFieldType}
                label={item.label}
                options={item.optionList || []}
                optionTooltipList={item.optionTooltipList || []}
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
                <CloseButton
                  size="xs"
                  p={0}
                  m={0}
                  onClick={() => handlers.remove(index)}
                />
              </Group>
            </Group>
            <Divider size="xs" my="xs" />
            {item.type &&
              item.type !== "section" &&
              item.type !== "repeatable_section" && (
                <Group mt="xs">
                  <TextInput
                    placeholder={`Add field tooltip`}
                    size="xs"
                    value={item.tooltip}
                    onChange={(event) =>
                      handleUpdateFieldTooltip(
                        item.id,
                        event.currentTarget.value
                      )
                    }
                  />
                  <Checkbox
                    size="xs"
                    label="Required"
                    onChange={(event) =>
                      handleToggleIsRequired(
                        item.id,
                        event.currentTarget.checked
                      )
                    }
                  />
                </Group>
              )}
            {item.type === "select" && (
              <Group noWrap mt="md">
                <TextInput
                  size="xs"
                  placeholder="Add option"
                  // value={newOption}
                  // onChange={(event) => setNewOption(event.currentTarget.value)}
                  value={item.newOption}
                  onChange={(event) =>
                    handleOptionChange(item.id, event.currentTarget.value)
                  }
                />
                <TextInput
                  // placeholder="Add option tooltip"
                  placeholder={`Add option description`}
                  size="xs"
                  value={item.newOptionTooltip}
                  onChange={(event) =>
                    handleOptionTooltipChange(
                      item.id,
                      event.currentTarget.value
                    )
                  }
                />
                <Tooltip label={`Add ${item.type} option`}>
                  <ActionIcon
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      handleAddOption(
                        item.id,
                        item.newOption || "",
                        item.newOptionTooltip || ""
                      )
                    }
                  >
                    <IconPlus size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
            {item.type === "multiple" && (
              <Group noWrap mt="md">
                <TextInput
                  size="xs"
                  placeholder="Add option"
                  // value={newOption}
                  // onChange={(event) => setNewOption(event.currentTarget.value)}
                  value={item.newOption}
                  onChange={(event) =>
                    handleOptionChange(item.id, event.currentTarget.value)
                  }
                />
                <TextInput
                  placeholder={`Add option description`}
                  size="xs"
                  value={item.newOptionTooltip}
                  onChange={(event) =>
                    handleOptionTooltipChange(
                      item.id,
                      event.currentTarget.value
                    )
                  }
                />
                <Tooltip label={`Add ${item.type} option`}>
                  <ActionIcon
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      handleAddOption(
                        item.id,
                        item.newOption || "",
                        item.newOptionTooltip || ""
                      )
                    }
                  >
                    <IconPlus size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          </Box>
        </div>
      )}
    </Draggable>
  ));

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        style={{ position: "fixed" }}
      />
      <Text size="xl" mb="xl" weight="bolder">
        Build form
      </Text>
      <Container
        className={classes.container}
        style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
      >
        <Group position="left" noWrap mb="xl">
          {/* <Text>Form Name</Text> */}
          <TextInput
            size="md"
            value={formName}
            onChange={(event) => setFormName(event.currentTarget.value)}
            label="Form Name"
            required
            withAsterisk
          />
        </Group>
        <Divider />

        <Group position="left" my="xl">
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
                searchable
                data={requestFieldTypeList.map((type) => ({
                  value: type,
                  label: startCase(type),
                }))}
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
              {/* <Button onClick={handleAddSection} size="sm">
                Add Section
              </Button> */}
            </Group>
          </Container>
        </div>

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
            const { approverId, approverUsername, approverActionName } = trail;
            return (
              <Group noWrap mt="xs" key={index}>
                <List.Item>{`Will be ${approverActionName} by ${approverUsername}`}</List.Item>
                <Chip
                  size="xs"
                  variant="outline"
                  checked={approverId === primaryApproverId}
                  onChange={() => setPrimaryApproverId(approverId)}
                >
                  {approverId === primaryApproverId && "Primary Approver"}
                  {approverId &&
                    approverId !== primaryApproverId &&
                    "Secondary Approver"}
                </Chip>
                <Tooltip label="Remove field">
                  <CloseButton
                    size="xs"
                    p={0}
                    m={0}
                    onClick={() => handleRemoveSigner(index)}
                  />
                </Tooltip>
              </Group>
            );
          })}
        </List>

        <Group position="center" noWrap>
          <Select
            size="sm"
            placeholder="Signer"
            onChange={(username) => setNewSignerUsername(username || "")}
            value={newSignerUsername}
            searchable
            nothingFound="Team member not found"
            data={teamMemberList
              .map((member) => ({
                value: member.username as string,
                label: member.username as string,
              }))
              .filter((member) => {
                if (requestTrail.length === 0) return true;
                return !requestTrail.some(
                  (trail) => trail.approverUsername === member.value
                );
              })}
          />
          {/* <TextInput
            placeholder="Action"
            size="sm"
            value={newSignerAction}
            onChange={(event) => setNewSignerAction(event.currentTarget.value)}
          /> */}
          <Autocomplete
            placeholder="Signed as this action"
            size="sm"
            value={toLower(newSignerAction)}
            data={["approved", "purchased"]}
            onChange={(value) => setNewSignerAction(value)}
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
                  requestTrail,
                  primaryApproverId
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
