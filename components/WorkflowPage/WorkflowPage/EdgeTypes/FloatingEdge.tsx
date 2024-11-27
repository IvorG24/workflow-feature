import { getEdgeParams } from "@/utils/reactflow";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  useInternalNode,
} from "@xyflow/react";

const FloatingEdge = (props: EdgeProps) => {
  const { source, target, markerEnd, style } = props;
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <BaseEdge style={style} markerEnd={markerEnd} path={edgePath} {...props} />
  );
};

export default FloatingEdge;
