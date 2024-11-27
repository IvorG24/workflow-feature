import { positionList } from "@/utils/reactflow";
import { BasicNodeType } from "@/utils/types";
import { Box, Center, Paper, Textarea } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Handle, NodeProps, Position, useNodesData } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

type BasicNodeProps = NodeProps & { data: BasicNodeType["data"] };

const BasicNode = ({ id, data, isConnectable, selected }: BasicNodeProps) => {
  const { hovered, ref } = useHover();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("");

  const style = { opacity: hovered ? 1 : 0 };
  const nodeData = useNodesData<BasicNodeType>(id);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => textAreaRef.current?.select());
  };

  useEffect(() => {
    setLabel(nodeData?.data.nodeStyle.label as string);
  }, [nodeData?.data.nodeStyle.label]);

  return (
    <Paper
      w={"auto"}
      ref={ref}
      p="md"
      shadow="md"
      style={{
        backgroundColor: data.nodeStyle.backgroundColor,
        borderColor: selected ? "#339af0" : "#A6A7AB",
        cursor: "pointer",
      }}
      withBorder
      onDoubleClick={handleDoubleClick}
      pos="relative"
    >
      <Box
        pos="absolute"
        h="170%"
        w="130%"
        sx={{ top: "-35%", left: "-15%" }}
      />
      {positionList.map((position, index) => (
        <Handle
          key={index}
          id={`target-${position.toLowerCase()}`}
          type="target"
          position={Position[position]}
          style={style}
          isConnectable={isConnectable}
        />
      ))}
      <Center h="auto">
        <Textarea
          ref={textAreaRef}
          variant="unstyled"
          value={label}
          onBlur={handleBlur}
          disabled={!isEditing}
          autosize
          styles={{
            input: {
              textAlign: "center",
              fontSize: 16,
              cursor: isEditing ? "text" : "pointer",
              color: data.nodeStyle.fontColor,
              padding: "0 !important",
              "&:disabled": {
                backgroundColor: "transparent",
                color: data.nodeStyle.fontColor,
                cursor: "not-allowed",
                opacity: 1,
              },
            },
          }}
        />
      </Center>

      {positionList.map((position, index) => (
        <Handle
          key={index}
          id={`source-${position.toLowerCase()}`}
          type="source"
          position={Position[position]}
          style={style}
          isConnectable={isConnectable}
        />
      ))}
    </Paper>
  );
};

export default BasicNode;
