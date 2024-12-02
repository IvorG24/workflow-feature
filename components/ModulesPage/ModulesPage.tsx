import { getModulePageNode } from "@/backend/api/get";
import { createModule, createNewVersionModule } from "@/backend/api/post";
import { useModuleAction } from "@/hooks/useModuleStore";
import { useFormStore } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { ModuleType, workFlowType } from "@/utils/types";
import {
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconEdit, IconPlus, IconTablePlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import ModulesColumns from "./ModulesColumn";
type Props = {
  mode: "create" | "edit" | "view";
  initialData?: {
    initialLabel: string;
    initialVersion: number;
  };
  moduleVersionId?: string;
  moduleId?: string;
};

const ModulesPage = ({
  mode,
  initialData = { initialLabel: "", initialVersion: 0 },
  moduleVersionId = "",
  moduleId = "",
}: Props) => {
  const [moduleItems, setModuleItems] = useState<ModuleType[]>([]);
  const [workFlow, setWorkFlow] = useState<workFlowType[]>([]);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState("");

  const labelRef = useRef<HTMLInputElement | null>(null);
  const columnBodyRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();
  const supabaseClient = useSupabaseClient();

  const { formList } = useFormStore();
  const { addModule } = useModuleAction();

  const checkFormNamesIsValid = (moduleItems: ModuleType[]): boolean => {
    return moduleItems.some(
      (item) => item.module_temp_workflow_name === "Empty"
    );
  };
  const checkWorkflowsIsValid = (moduleItems: ModuleType[]): boolean => {
    return moduleItems.some((item) => item.module_temp_form_name === "Empty");
  };
  const getSameName = async (label: string) => {
    try {
      const { data } = await supabaseClient
        .schema("workflow_schema")
        .from("module_table")
        .select()
        .eq("module_name", label);

      return data;
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };
  // Handler for adding an empty column
  const addEmptyColumn = () => {
    setModuleItems((prev) => {
      // Find the maximum `module_form_order` in the existing `moduleItems`
      const maxOrder = prev.reduce(
        (max, item) => Math.max(max, item.module_temp_id),
        0
      );

      return [
        ...prev,
        {
          module_temp_id: maxOrder + 1,
          module_temp_form_name: "Empty",
          module_temp_workflow_name: "Empty",
          module_connection_form_id: "",
          module_connection_workflow_id: "",
        },
      ];
    });
  };
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const dateTime = `${year}-${month}-${day}T00:00:00Z`;

    return dateTime;
  };
  // Handler for form submission
  const handleCreateModule = async () => {
    try {
      setIsLoading(true);
      if (!label) {
        labelRef.current?.focus();
        notifications.show({
          message: "Please provide a label for the workflow.",
          color: "orange",
        });
        return;
      }

      if (checkFormNamesIsValid(moduleItems)) {
        notifications.show({
          message: "Please make sure all items are correctly filled out.",
          color: "orange",
        });
        return;
      }

      if (checkWorkflowsIsValid(moduleItems)) {
        notifications.show({
          message: "Please make sure all items are correctly filled out.",
          color: "orange",
        });
        return;
      }

      if (moduleItems.length === 0) {
        notifications.show({
          message: "Please add at least one module to proceed.",
          color: "orange",
        });
        return;
      }

      const dataDuplicateName = await getSameName(label);

      if (dataDuplicateName && dataDuplicateName?.length > 0) {
        notifications.show({
          message: `A module named "${label}" already exists. Please choose a different name.`,
          color: "orange",
        });
        return;
      }

      const updatedModuleItems = moduleItems.map((item, index) => ({
        ...item,
        module_connection_order: index + 1,
      }));

      if (!teamMember?.team_member_id) {
        throw new Error();
      }

      const moduleflowId = await createModule(supabaseClient, {
        label,
        moduleItems: updatedModuleItems,
        teamId: activeTeam.team_id,
        teamMemberId: teamMember.team_member_id,
      });

      const newModule = {
        module_id: moduleflowId,
        module_name: label,
      };

      addModule(newModule);
      
      notifications.show({
        message: "Module created.",
        color: "green",
      });

      await router.push(
        `/${formatTeamNameToUrlKey(
          activeTeam.team_name
        )}/modules/${moduleflowId}`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Handle drag start
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    id: number
  ) => {
    event.dataTransfer.setData("text/plain", id.toString());
  };
  // Handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  // Handle drop
  const handleNodeDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: number
  ) => {
    event.preventDefault();
    const draggedId = parseInt(event.dataTransfer.getData("text/plain"), 10);

    if (draggedId === targetId) return;

    setModuleItems((prev) => {
      const draggedIndex = prev.findIndex(
        (item) => item.module_temp_id === draggedId
      );
      const targetIndex = prev.findIndex(
        (item) => item.module_temp_id === targetId
      );

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const updatedItems = [...prev];

      [updatedItems[draggedIndex], updatedItems[targetIndex]] = [
        updatedItems[targetIndex],
        updatedItems[draggedIndex],
      ];

      return updatedItems;
    });
  };

  const handleUpdateModule = async () => {
    try {
      setIsLoading(true);
      if (!label) {
        labelRef.current?.focus();
        notifications.show({
          message: "Please provide a label for the workflow.",
          color: "orange",
        });
        return;
      }

      if (checkFormNamesIsValid(moduleItems)) {
        notifications.show({
          message: "Please make sure all items are correctly filled out.",
          color: "orange",
        });
        return;
      }

      if (checkWorkflowsIsValid(moduleItems)) {
        notifications.show({
          message: "Please make sure all items are correctly filled out.",
          color: "orange",
        });
        return;
      }

      if (moduleItems.length === 0) {
        notifications.show({
          message: "Please add at least one module to proceed.",
          color: "orange",
        });
        return;
      }

      const updatedModuleItems = moduleItems.map((item, index) => ({
        ...item,
        module_connection_order: index + 1,
      }));

      if (!teamMember?.team_member_id) {
        throw new Error();
      }

      const moduleflowId = await createNewVersionModule(supabaseClient, {
        moduleItems: updatedModuleItems,
        moduleId: moduleId,
        teamMemberId: teamMember.team_member_id,
        currentDate: getCurrentDate(),
      });

      notifications.show({
        message: "Module Updated.",
        color: "green",
      });

      await router.push(
        `/${formatTeamNameToUrlKey(
          activeTeam.team_name
        )}/modules/${moduleflowId}`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflowList = async () => {
    try {
      const { data } = await supabaseClient
        .schema("workflow_schema")
        .from("workflow_table")
        .select();

      if (data) {
        setWorkFlow(data);
      }
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const getInitialNodes = async () => {
    try {
      const data = await getModulePageNode(supabaseClient, {
        moduleVersionId: moduleVersionId,
      });

      if (data) {
        setModuleItems(data);
      }
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const gotoEditHandler = async () => {
    const currentPath = router.asPath;

    const newPath = `${currentPath}${currentPath.endsWith("/") ? "" : "/edit"}`;

    await router.push(newPath);
  };

  useEffect(() => {
    fetchWorkflowList();
    if (mode !== "create") {
      getInitialNodes();
      setLabel(initialData?.initialLabel);
    }
  }, []);

  return (
    <Container fluid>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      <Flex gap="xs" mt={-5} mb="xs" direction="column">
        <Flex align="center" gap="xs">
          <Title order={3} color="dimmed">
            {mode === "create" && "Create Module"}
            {mode === "view" &&
              `View Module ${label} v${initialData?.initialVersion}`}
            {mode === "edit" &&
              `Edit Module ${label} v${initialData?.initialVersion}`}
          </Title>
          {mode === "create" && (
            <TextInput
              placeholder="Type module label here"
              value={label}
              onChange={(e) => setLabel(e.currentTarget.value)}
              ref={labelRef}
            />
          )}
        </Flex>
        {mode === "create" && (
          <Text color="dimmed" fz="sm">
            This page allows to create a module flow by linking forms and
            workflows.
          </Text>
        )}
      </Flex>
      <Paper
        withBorder
        h={780}
        pos="relative"
        sx={{ overflow: "auto", position: "relative" }}
      >
        {/* Menu */}
        <Flex
          sx={{
            borderBottom: "0.0625rem solid #dee2e6",
            backgroundColor: "#E9ECEF",
            position: "sticky",
            top: "0px",
          }}
          p="md"
          gap="md"
          align="center"
          justify="space-between"
          style={{ zIndex: "50" }}
        >
          <Flex gap={10} align="center">
            {mode !== "view" && (
              <Button
                variant="default"
                leftIcon={<IconPlus size={14} stroke={5} color="#141517" />}
                onClick={addEmptyColumn}
              >
                Add Node
              </Button>
            )}
          </Flex>

          <Flex gap={10} align="center">
            {mode === "create" && (
              <Button
                onClick={handleCreateModule}
                leftIcon={<IconTablePlus size={16} />}
              >
                Submit
              </Button>
            )}
            {mode === "edit" && (
              <Button
                onClick={handleUpdateModule}
                leftIcon={<IconTablePlus size={16} />}
              >
                Save
              </Button>
            )}
            {mode === "view" && (
              <Button
                onClick={gotoEditHandler}
                leftIcon={<IconEdit size={16} />}
              >
                Edit Module
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Body */}
        <Flex sx={{ position: "relative" }} ref={columnBodyRef}>
          <Flex gap={10} p="md" align="center" wrap="wrap">
            {moduleItems.map((item, index) => (
              <ModulesColumns
                key={item.module_temp_id}
                id={item.module_temp_id}
                index={index}
                workflowName={item.module_temp_workflow_name}
                formName={item.module_temp_form_name}
                initialFormData={formList}
                initialWorkflowData={workFlow}
                setModuleItems={setModuleItems}
                moduleItems={moduleItems}
                setActiveColumn={setActiveColumnId}
                onDragStart={(event) =>
                  handleDragStart(event, item.module_temp_id)
                }
                onDragOver={handleDragOver}
                onDrop={(event) => handleNodeDrop(event, item.module_temp_id)}
                columnBodyRef={columnBodyRef}
                isEdit={activeColumnId === item.module_temp_id}
                setIsEdit={(isEdit) => {
                  if (isEdit) {
                    setActiveColumnId(item.module_temp_id);
                  }
                }}
                mode={mode}
              />
            ))}
          </Flex>
        </Flex>
      </Paper>
    </Container>
  );
};

export default ModulesPage;
