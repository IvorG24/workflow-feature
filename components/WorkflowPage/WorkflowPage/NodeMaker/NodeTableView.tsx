import { COLOR_SET_OPTIONS } from "@/utils/constant";
import { NodeOption } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

type Props = {
  nodeTypesList: NodeOption[];
  handleAction: (nodeId: string, nodeLabel: string) => void;
  isLoading: boolean;
};

const NodeTableView = ({ nodeTypesList, handleAction, isLoading }: Props) => {
  return (
    <Table highlightOnHover>
      <LoadingOverlay visible={isLoading} />
      <tbody>
        {nodeTypesList.map((nodes) => (
          <tr key={nodes.value}>
            <td>
              <Text>{nodes.label}</Text>
            </td>
            <td>
              <Group position="right">
                <Tooltip label={`Preview of ${nodes.presetLabel}`}>
                  <Button
                    w={200}
                    color={
                      COLOR_SET_OPTIONS[
                        nodes.presetBackgroundColor as keyof typeof COLOR_SET_OPTIONS
                      ]
                    }
                    sx={{
                      color: nodes.presetTextColor,
                    }}
                  >
                    {nodes.presetLabel.length > 10
                      ? `${nodes.presetLabel.slice(0, 10)}...`
                      : nodes.presetLabel}
                  </Button>
                </Tooltip>
                <ActionIcon
                  color="red"
                  onClick={async () => handleAction(nodes.value, nodes.label)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default NodeTableView;
