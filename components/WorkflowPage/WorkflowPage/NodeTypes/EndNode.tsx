import { positionList } from "@/utils/reactflow";
import { Box, Center, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Handle, NodeProps, Position } from "@xyflow/react";

const EndNode = (props: NodeProps) => {
  const { hovered, ref } = useHover();
  const style = { opacity: hovered ? 1 : 0 };

  return (
    <Box
      id={props.id}
      w={100}
      h={100}
      ref={ref}
      style={{
        borderRadius: 50,
        border: "0.0625rem solid #dee2e6",
        backgroundColor: "#FFE4E1",
      }}
    >
      <Center h={100}>
        <Text>Next</Text>
      </Center>
      {positionList.map((position, index) => (
        <Handle
          key={index}
          id={`target-${position.toLowerCase()}`}
          type="target"
          position={Position[position]}
          style={style}
          isConnectable={props.isConnectable}
        />
      ))}
      {positionList.map((position, index) => (
        <Handle
          key={index}
          id={`source-${position.toLowerCase()}`}
          type="source"
          position={Position[position]}
          style={style}
        />
      ))}
    </Box>
  );
};

export default EndNode;
