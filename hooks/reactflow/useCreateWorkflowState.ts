import { defaultMarkerEnd, defaultPosition } from "@/utils/reactflow";
import {
  BasicEdgeType,
  BasicNodeType,
  NodeAdvanceSettings,
} from "@/utils/types";
import { notifications } from "@mantine/notifications";
import {
  addEdge,
  Edge,
  getConnectedEdges,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnReconnect,
  reconnectEdge,
  useReactFlow,
  XYPosition,
} from "@xyflow/react";
import { Dispatch, SetStateAction, useCallback, useRef } from "react";
import { v4 } from "uuid";

type Props = {
  nodes: BasicNodeType[];
  setNodes: Dispatch<SetStateAction<BasicNodeType[]>>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<BasicEdgeType[]>>;
  showTransitionLabel: boolean;
  selectedNode: BasicNodeType | null;
};

export const useWorkflowState = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  showTransitionLabel,
  selectedNode,
}: Props) => {
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const connectionFromHandleId = useRef<string | null>(null);
  const connectionFromHandleType = useRef<string | null>(null);

  const handleAddNode = useCallback(
    (
      position?: XYPosition,
      label?: string,
      type: "basic" | "end" | "origin" = "basic",
      presetLabel = "[empty]",
      presetBackgroundColor = "#ffffff",
      presetTextColor = "#000000"
    ) => {
      const nodeLabel = label || presetLabel;
      const newNode = {
        id: v4(),
        type,
        data: {
          nodeStyle: {
            label: nodeLabel,
            fontColor: presetTextColor,
            backgroundColor: presetBackgroundColor,
          },
          nodeProjectWithSignerList:
            [] as NodeAdvanceSettings["nodeProjectWithSignerList"],
          onNodeStyleChange,
          onNodeSignerChange,
        },
        position: position
          ? { x: position.x - 60, y: position.y - 36 }
          : defaultPosition,
        deletable: true,
        focusable: true,
      };

      setNodes((nodes) => [...nodes, newNode]);
      return newNode;
    },
    []
  );
  const handlePasteNode = useCallback(async (node: BasicNodeType) => {
    const newNode = {
      ...node,
      id: v4(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
    };
    setNodes((nodes) => [
      ...nodes.map((node) => {
        return {
          ...node,
          selected: false,
        };
      }),
      newNode,
    ]);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id));
    setEdges((edges) =>
      edges.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );
  }, [selectedNode]);

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNode) return;

    const duplicateNode = {
      ...selectedNode,
      id: v4(),
      position: {
        x: selectedNode.position.x + 20,
        y: selectedNode.position.y + 20,
      },
      selected: true,
    };
    const connectedEdges = getConnectedEdges(nodes, edges);
    const duplicateEdges = connectedEdges.filter(
      (edge) =>
        edge.target === selectedNode.id || edge.source === selectedNode.id
    ) as BasicEdgeType[];

    const newEdges = duplicateEdges.map((edge: BasicEdgeType) => {
      const newEdge = {
        ...edge,
        id: v4(),
        source:
          edge.source === selectedNode.id ? duplicateNode.id : edge.source,
        target:
          edge.target === selectedNode.id ? duplicateNode.id : edge.target,
      };
      return newEdge;
    });

    setNodes((nodes) => [
      ...nodes.map((node) => {
        return {
          ...node,
          selected: false,
        };
      }),
      duplicateNode,
    ]);
    setEdges((edges) => [...edges, ...newEdges]);
  }, [selectedNode, nodes, edges]);

  const handleAddNodeOnDrop = useCallback(
    (parentNode: BasicNodeType | null, position: XYPosition) => {
      if (!parentNode) return;
      const isSourceNodeOrigin = parentNode.type === "origin";
      // check if there's already an edge from the start node
      if (isSourceNodeOrigin) {
        let isValid = true;
        for (const edge of edges) {
          if (edge.source === parentNode.id) {
            isValid = false;
            break;
          }
        }
        if (!isValid) {
          notifications.show({
            title: "Invalid Edge",
            message: "There must be only one edge on the start node.",
            color: "orange",
          });
          return;
        }
      }
    },
    [edges, nodes]
  );

  const onConnect: OnConnect = useCallback(
    ({ source, target, sourceHandle, targetHandle }) => {
      // Find the origin and end nodes
      const originNode = nodes.find((node) => node.type === "origin");
      const endNodes = nodes.filter((node) => node.type === "end");

      if (endNodes.some((endNode) => source === endNode.id)) {
        notifications.show({
          title: "Invalid Edge",
          message: "An end node cannot be the source of an edge.",
          color: "orange",
        });
        return;
      } else if (target === originNode?.id) {
        notifications.show({
          title: "Invalid Edge",
          message: "An origin node cannot be the target of an edge.",
          color: "orange",
        });
        return;
      } else if (source === originNode?.id) {
        const hasExistingEdge = edges.some(
          (edge) => edge.source === originNode?.id
        );

        if (hasExistingEdge) {
          notifications.show({
            title: "Invalid Edge",
            message: "There must be only one edge from the origin node.",
            color: "orange",
          });
          return;
        }
      }

      setEdges((eds) =>
        addEdge(
          {
            id: v4(),
            source,
            target,
            sourceHandle,
            targetHandle,
            type: "basic",
            markerEnd: defaultMarkerEnd,
            data: {
              label:
                target === endNodes.find((endNode) => target === endNode.id)?.id
                  ? ""
                  : source === originNode?.id
                    ? ""
                    : "[transition]",
              description: "",
              showTransitionLabel,
              onEdgeDataChange,
              onDeleteEdge,
              isStartEdge: source === originNode?.id,
              isEndEdge: endNodes.some((endNode) => target === endNode.id),
            },
          },
          eds
        )
      );
    },
    [setEdges, nodes, edges]
  );

  const onReconnect: OnReconnect = useCallback((oldEdge, newConnection) => {
    setEdges((els) =>
      reconnectEdge(oldEdge as BasicEdgeType, newConnection, els)
    );
  }, []);

  const onConnectStart: OnConnectStart = useCallback((_, params) => {
    connectingNodeId.current = params.nodeId;
    connectionFromHandleId.current = params.handleId;
    connectionFromHandleType.current = params.handleType;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodes.find(
          (node) => node.id === connectingNodeId.current
        );
        if (!parentNode) return;
        const panePosition = screenToFlowPosition({
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        });

        handleAddNodeOnDrop(parentNode, panePosition);
      }
    },
    [nodes, screenToFlowPosition, handleAddNodeOnDrop]
  );

  const onNodeStyleChange = (
    nodeId: string,
    newData: BasicNodeType["data"]["nodeStyle"]
  ) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, nodeStyle: { ...newData } } };
        }
        return node;
      })
    );
  };

  const onNodeSignerChange = (
    nodeId: string,
    newData: BasicNodeType["data"]["nodeProjectWithSignerList"]
  ) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, nodeProjectWithSignerList: newData },
          };
        }
        return node;
      })
    );
  };

  const onEdgeDataChange = (edgeId: string, newData: BasicEdgeType["data"]) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...newData } };
        }
        return edge;
      })
    );
  };

  const onDeleteEdge = useCallback((nodeId: string) => {
    setEdges((edges) => edges.filter((edge) => edge.id !== nodeId));
  }, []);

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
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
  };
};
