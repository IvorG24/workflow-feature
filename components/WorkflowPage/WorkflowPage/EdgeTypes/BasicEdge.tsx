import { useEdgesData } from "@/hooks/reactflow/useEdgesData";
import { BasicEdgeType } from "@/utils/types";
import { ActionIcon, Center, Group, Paper, Textarea } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type BasicEdgeProps = EdgeProps & {
  data: BasicEdgeType["data"];
};

const BasicEdge = (props: BasicEdgeProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const edgeData = useEdgesData<BasicEdgeType>(id);

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("");

  const handleLabelChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!edgeData) return;
    const updatedData = { ...edgeData.data, label: event.currentTarget.value };
    data.onEdgeDataChange(id, updatedData);
    setLabel(event.currentTarget.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    setLabel(edgeData?.data.label as string);
  }, [edgeData?.data.label]);

  const handleDoubleClick = () => {
    if (data.isStartEdge) return;
    if (data.isEndEdge) return;
    setIsEditing(true);
    setTimeout(() => textAreaRef.current?.select());
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        {...props}
        style={{ stroke: selected ? "#339af0" : "#A6A7AB" }}
      />
      <EdgeLabelRenderer>
        {selected && !isEditing && (
          <Group
            spacing="xs"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                labelY + 40
              }px)`,
              pointerEvents: "all",
              opacity:
                (selected || data.showTransitionLabel) &&
                !data.isStartEdge &&
                !data.isEndEdge
                  ? 1
                  : 0,
              zIndex: 9,
            }}
          >
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => data.onDeleteEdge(id)}
            >
              <IconTrash size={16} color="red" />
            </ActionIcon>
          </Group>
        )}
        <Paper
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            opacity:
              (selected || data.showTransitionLabel) &&
              !data.isStartEdge &&
              !data.isEndEdge
                ? 1
                : 0,
            overflowWrap: "break-word",
            borderColor: selected ? "#339af0" : "#A6A7AB",
            backgroundColor: "#E7F5FF",
            cursor: "pointer",
          }}
          onDoubleClick={handleDoubleClick}
        >
          <Center h="auto">
            <Textarea
              ref={textAreaRef}
              variant="unstyled"
              value={label}
              onChange={handleLabelChange}
              onBlur={handleBlur}
              readOnly={!isEditing}
              w={100}
              autosize
              disabled={!isEditing}
              styles={{
                input: {
                  textAlign: "center",
                  fontSize: 14,
                  cursor: isEditing ? "text" : "pointer",
                  overflowWrap: "break-word",
                  "&:disabled": {
                    backgroundColor: "transparent",
                    color: "#495057",
                    cursor: "not-allowed",
                    opacity: 1,
                  },
                },
              }}
            />
          </Center>
        </Paper>
      </EdgeLabelRenderer>
    </>
  );
};

export default BasicEdge;
