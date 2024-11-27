import { BasicNodeType } from "@/utils/types";
import { ActionIcon, Group } from "@mantine/core";
import { IconCopy, IconTrash } from "@tabler/icons-react";
import { NodeToolbar, Position } from "@xyflow/react";
import NodeAdvanceSettings from "./NodeAdvanceSettings";

type Props = {
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenNodeChangeStylesForm: (selectedNode: BasicNodeType) => void;
  selectedNode: BasicNodeType;
};

const CustomNodeToolbar = ({ onDelete, onDuplicate, selectedNode }: Props) => {
  const isEndNode = selectedNode?.type === "end";

  return (
    <NodeToolbar
      isVisible={Boolean(selectedNode) && selectedNode?.type !== "origin"}
      position={Position.Bottom}
      nodeId={selectedNode?.id}
    >
      <Group spacing="xs" className="nodrag">
        {isEndNode && (
          <ActionIcon onClick={onDelete} color="red" variant="light">
            <IconTrash size={16} color="red" />
          </ActionIcon>
        )}
        {!isEndNode && (
          <>
            <ActionIcon onClick={onDelete} color="red" variant="light">
              <IconTrash size={16} color="red" />
            </ActionIcon>
            <ActionIcon onClick={onDuplicate} variant="light" color="#4DABF7">
              <IconCopy size={16} />
            </ActionIcon>
            <NodeAdvanceSettings selectedNode={selectedNode} />
          </>
        )}
      </Group>
    </NodeToolbar>
  );
};

export default CustomNodeToolbar;
