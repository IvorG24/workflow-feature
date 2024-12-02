import {
  getEdgeInWorkflowPage,
  getNodeInWorkflowPage,
  getNodeTypesOption,
} from "@/backend/api/get";
import { checkWorkflowLabelExists, createWorkflow } from "@/backend/api/post";
import { updateWorkflow } from "@/backend/api/update";
import { useWorkflowState } from "@/hooks/reactflow/useCreateWorkflowState";
import { useKeyState } from "@/hooks/useKeyState";
import { useLoadingActions, useLoadingStore } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { capitalizeEachWord, formatTeamNameToUrlKey } from "@/utils/string";
import {
  BasicEdgeType,
  BasicNodeType,
  NodeChangeStylesFormValues,
  NodeOption,
} from "@/utils/types";
import {
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import CustomNodeToolbar from "./CustomNodeToolbar";
import BasicEdge from "./EdgeTypes/BasicEdge";
import FloatingEdge from "./EdgeTypes/FloatingEdge";
import { default as BasicNode } from "./NodeTypes/BasicNode";
import EndNode from "./NodeTypes/EndNode";
import OriginNode from "./NodeTypes/OriginNode";
import WorkflowMenu from "./WorkflowMenu";

const nodeTypes = {
  origin: OriginNode,
  basic: BasicNode,
  end: EndNode,
};

const edgeTypes = {
  floating: FloatingEdge,
  basic: BasicEdge,
};

type Props = {
  mode: "create" | "edit" | "view";
  workflowVersionId?: string;
  initialData?: {
    initialLabel: string;
    initialVersion: number;
  };
};

const WorkflowPage = ({
  mode,
  workflowVersionId = "",
  initialData = { initialLabel: "", initialVersion: 0 },
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();

  const { isLoading } = useLoadingStore();
  const { setIsLoading } = useLoadingActions();
  const { keyboardShortcut } = useKeyState();

  const [label, setLabel] = useState(initialData.initialLabel);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as BasicNodeType[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as BasicEdgeType[]);
  const [nodeOptions, setNodeOptions] = useState<NodeOption[]>([]);
  const [showTransitionLabel, setShowTransitionLabel] = useState(false);
  const [copiedNode, setCopiedNode] = useState<BasicNodeType | null>(null);

  const labelRef = useRef<HTMLInputElement | null>(null);
  const selectedNode = nodes.find((node) => node.selected) ?? null;
  const workflowUUID = router.query.workflowId as string;

  const {
    handleAddNode,
    handleDeleteNode,
    handleDuplicateNode,
    handlePasteNode,
    onConnect,
    onReconnect,
    onConnectStart,
    onConnectEnd,
    onNodeStyleChange,
    onNodeSignerChange,
    onEdgeDataChange,
    onDeleteEdge,
  } = useWorkflowState({
    nodes,
    setNodes,
    edges,
    setEdges,
    showTransitionLabel,
    selectedNode,
  });

  useEffect(() => {
    if (
      keyboardShortcut === "copy" &&
      selectedNode &&
      selectedNode.type !== "origin"
    ) {
      setCopiedNode(selectedNode);
    } else if (keyboardShortcut === "paste" && copiedNode) {
      handlePasteNode(copiedNode);
    }
  }, [keyboardShortcut]);

  const nodeChangeStylesFormMethods = useForm<NodeChangeStylesFormValues>({
    mode: "onChange",
  });

  const handleOpenNodeChangeStylesForm = (
    selectedNode: BasicNodeType | null
  ) => {
    if (selectedNode) {
      const nodeStyle = selectedNode.data.nodeStyle as {
        fontColor: string;
        backgroundColor: string;
      };
      nodeChangeStylesFormMethods.setValue("fontColor", nodeStyle.fontColor);
      nodeChangeStylesFormMethods.setValue(
        "backgroundColor",
        nodeStyle.backgroundColor
      );
    }
  };

  const handleOutsideClick = () => {
    window?.getSelection()?.removeAllRanges();
  };

  const handleShowTransitionLabel = (showTransitionLabel: boolean) => {
    setShowTransitionLabel(showTransitionLabel);
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        data: { ...edge.data, showTransitionLabel },
      }))
    );
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (!label) {
        labelRef.current?.focus();
        notifications.show({
          message: "Workflow label is required",
          color: "orange",
        });
        return;
      }

      if (!teamMember?.team_member_id) return;

      const hasEndNode = nodes.some((node) => node.type === "end");
      if (!hasEndNode) {
        notifications.show({
          title: "Invalid Submission",
          message: "At least one end node is required before submitting.",
          color: "orange",
        });
        return;
      }
      const basicNodes = nodes.filter((node) => node.type === "basic");
      const endNodes = nodes.filter((node) => node.type === "end");
      const hasEmptyLabelNode = basicNodes.some(
        (node) =>
          (node.data?.nodeStyle as { label?: string })?.label === "[empty]"
      );

      if (hasEmptyLabelNode) {
        notifications.show({
          title: "Invalid Submission",
          message: "All nodes must have a label.",
          color: "orange",
        });
        return;
      }

      const hasUntargetedNode =
        basicNodes.some(
          (node) => !edges.some((edge) => edge.target === node.id)
        ) ||
        endNodes.some((node) => !edges.some((edge) => edge.target === node.id));

      if (hasUntargetedNode) {
        notifications.show({
          title: "Invalid Submission",
          message: "Next nodes and basic nodes must be targeted.",
          color: "orange",
        });
        return;
      }

      const hasEmptyTransitions = edges.some(
        (edge) => edge.data.label === "[transition]"
      );
      if (hasEmptyTransitions) {
        handleShowTransitionLabel(true);
        notifications.show({
          title: "Invalid Submission",
          message: "All transitions must have a label.",
          color: "orange",
        });
        return;
      }

      const hasEmptySigner = basicNodes.some((node) => {
        const isToolbarHidden = !edges.some((edge) => {
          if (edge.source === node.id) {
            const targetNode = nodes.find(
              (targetNode) => targetNode.id === edge.target
            );
            return targetNode && targetNode.type !== "end";
          }
          return false;
        });

        if (isToolbarHidden) {
          return false;
        }

        const signerList = node.data.nodeProjectWithSignerList;
        return !signerList || signerList.length === 0;
      });

      if (hasEmptySigner) {
        notifications.show({
          title: "Invalid Submission",
          message: "All visible nodes must have a signer.",
          color: "orange",
        });
        return;
      }

      switch (mode) {
        case "create":
          const labelExists = await checkWorkflowLabelExists(
            supabaseClient,
            label
          );
          if (labelExists) {
            notifications.show({
              message: "A workflow with this label already exists.",
              color: "orange",
            });
            return;
          }
          const workflowId = await createWorkflow(supabaseClient, {
            label,
            nodes,
            edges,
            teamId: activeTeam.team_id,
            teamMemberId: teamMember.team_member_id,
          });

          notifications.show({
            message: "Workflow created.",
            color: "green",
          });
          await router.push(
            `/${formatTeamNameToUrlKey(
              activeTeam.team_name
            )}/workflows/${workflowId}`
          );

          break;
        case "edit":
          await updateWorkflow(supabaseClient, {
            workflowId: workflowUUID,
            label,
            nodes,
            edges,
            teamId: activeTeam.team_id,
            teamMemberId: teamMember.team_member_id,
          });
          notifications.show({
            message: "Workflow updated.",
            color: "green",
          });
          await router.push(
            `/${formatTeamNameToUrlKey(
              activeTeam.team_name
            )}/workflows/${workflowUUID}`
          );
          break;
        case "view":
          await router.push(
            `/${formatTeamNameToUrlKey(
              activeTeam.team_name
            )}/workflows/${workflowUUID}/edit`
          );
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "create") {
      setNodes([
        {
          id: v4(),
          data: {
            nodeStyle: {
              label: "Start",
              fontColor: "#000",
              backgroundColor: "#fff",
            },
            nodeProjectWithSignerList: [],
            onNodeStyleChange,
            onNodeSignerChange,
          },
          type: "origin",
          position: { x: 100, y: 275 },
          deletable: false,
        },
      ]);
      setEdges([]);
    } else {
      try {
        setIsLoading(true);
        const fetchNodes = async () => {
          const nodeList: BasicNodeType[] = [];
          let index = 0;
          while (1) {
            const data = await getNodeInWorkflowPage(supabaseClient, {
              index,
              workflowVersionId,
            });
            nodeList.push(...data);
            index += 5;

            if (data.length < 5) break;
          }
          setNodes(
            nodeList.map((node) => {
              return {
                ...node,
                data: {
                  ...node.data,
                  onNodeStyleChange,
                  onNodeSignerChange,
                },
                draggable: mode === "edit",
                selectable: mode === "edit",
              };
            })
          );
        };
        const fetchEdges = async () => {
          const data = await getEdgeInWorkflowPage(supabaseClient, {
            workflowVersionId,
          });
          setEdges(
            data.map((edge) => {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  onEdgeDataChange,
                  onDeleteEdge,
                },
                selectable: mode === "edit",
              };
            })
          );
        };
        fetchNodes();
        fetchEdges();
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    const fetchNodeOptions = async () => {
      if (!activeTeam.team_id) {
        return;
      }

      let currentPage = 1;
      const limit = 500;
      const allNodeOptions = [];

      while (1) {
        const { nodeData } = await getNodeTypesOption(supabaseClient, {
          activeTeam: activeTeam.team_id,
          limit,
          page: currentPage,
        });

        allNodeOptions.push(...nodeData);

        if (nodeData.length < limit) {
          break;
        }

        currentPage++;
      }

      setNodeOptions(allNodeOptions);
    };

    fetchNodeOptions();
  }, [activeTeam.team_id]);

  const shouldHideToolbar = !edges.some((edge) => {
    if (edge.source === selectedNode?.id) {
      const targetNode = nodes.find((node) => node.id === edge.target);

      return targetNode && targetNode.type !== "end";
    }
    return false;
  });

  return (
    <Container fluid>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      <Flex align="center" justify="space-between" gap="xs" mt={-5} mb="xs">
        <Flex align="center" gap="xs">
          <Title order={3} color="dimmed">
            {capitalizeEachWord(mode)} Workflow
          </Title>
          {mode !== "view" && (
            <TextInput
              placeholder="Type workflow label here"
              value={label}
              disabled={mode === "edit" ? true : false}
              onChange={(e) => setLabel(e.currentTarget.value)}
              ref={labelRef}
            />
          )}
          {mode === "view" && (
            <Title order={3} color="dimmed">
              {label}{" "}
              {initialData.initialVersion
                ? `v${initialData.initialVersion}`
                : ""}
            </Title>
          )}
        </Flex>
      </Flex>
      <Paper withBorder h={780} pos="relative" sx={{ overflow: "hidden" }}>
        <WorkflowMenu
          nodes={nodes}
          onAddNode={(
            type,
            presetLabel,
            presetBackgroundColor,
            presetTextColor
          ) =>
            handleAddNode(
              undefined,
              undefined,
              type,
              presetLabel,
              presetBackgroundColor,
              presetTextColor
            )
          }
          showTransitionLabel={showTransitionLabel}
          onShowTransitionLabelChange={handleShowTransitionLabel}
          mode={mode}
          onSubmit={handleSubmit}
          options={nodeOptions}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onReconnect={onReconnect}
          onConnectEnd={onConnectEnd}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={["Delete", "Backspace"]}
          onPaneClick={handleOutsideClick}
          zoomOnDoubleClick={false}
          nodesConnectable={mode !== "view"}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} />
          {selectedNode && (
            <CustomNodeToolbar
              selectedNode={selectedNode}
              onDelete={handleDeleteNode}
              onDuplicate={handleDuplicateNode}
              onOpenNodeChangeStylesForm={handleOpenNodeChangeStylesForm}
              shouldHideToolbar={shouldHideToolbar}
            />
          )}
        </ReactFlow>
      </Paper>
    </Container>
  );
};

export default WorkflowPage;
