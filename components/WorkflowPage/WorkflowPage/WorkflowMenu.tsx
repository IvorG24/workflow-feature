import { useActiveTeam } from "@/stores/useTeamStore";
import { CREATE_NODE_OPTION } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { BasicNodeType, NodeOption } from "@/utils/types";
import {
  Button,
  Flex,
  LoadingOverlay,
  Paper,
  Select,
  Switch,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconEyeClosed,
  IconPlus,
  IconSquareRoundedPlusFilled,
  IconTablePlus,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import SelectItem from "./CustomSelect";

type Props = {
  nodes: BasicNodeType[];
  onAddNode: (
    type: "basic" | "end",
    presetLabel: string,
    presetBackgroundColor: string,
    presetTextColor: string
  ) => void;
  showTransitionLabel: boolean;
  onShowTransitionLabelChange: (showTransitionLabel: boolean) => void;
  options: NodeOption[];
  mode: "create" | "edit" | "view";
  onSubmit: () => void;
};

const WorkflowMenu = ({
  onAddNode,
  showTransitionLabel,
  onShowTransitionLabelChange,
  mode,
  nodes,
  options,
  onSubmit,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const newOptions = [...options, CREATE_NODE_OPTION];
  const [selectedNodeOption, setSelectedNodeOption] = useState<NodeOption>(
    newOptions[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  const buttonText = () => {
    switch (mode) {
      case "create":
        return "Submit";
      case "edit":
        return "Save";
      default:
        return "Edit Workflow";
    }
  };

  const buttonIcon = () => {
    switch (mode) {
      case "create":
        return <IconTablePlus size={16} />;
      case "edit":
        return <IconDeviceFloppy size={16} />;
      default:
        return <IconEdit size={16} />;
    }
  };

  const handleAddNodeClick = () => {
    const nodeLabel = selectedNodeOption?.presetLabel;
    const existingNode = nodes.find(
      (node) =>
        node.type === "basic" &&
        (node.data?.nodeStyle as { label?: string })?.label === nodeLabel
    );
    if (existingNode) {
      notifications.show({
        message: `A node with the label "${nodeLabel}" already exists.`,
        color: "orange",
      });
      return; // Prevent adding the node
    }
    if (!selectedNodeOption) {
      notifications.show({
        message: "Please select a valid node option before adding.",
        color: "red",
      });
      return;
    }
    onAddNode(
      selectedNodeOption.type,
      selectedNodeOption.presetLabel,
      selectedNodeOption.presetBackgroundColor,
      selectedNodeOption.presetTextColor
    );
  };

  const handleAddNextNode = () => {
    onAddNode("end", "End", "#FFE4E1", "#FFFFFF");
  };
  return (
    <Flex
      sx={{
        borderBottom: "0.0625rem solid #dee2e6",
        backgroundColor: "#E9ECEF",
      }}
      p="md"
      gap="md"
      align="center"
    >
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      {mode !== "view" && (
        <Flex gap="md" align="center">
          <Select
            searchable={true}
            value={selectedNodeOption?.value || ""}
            onChange={(value) => {
              const option = newOptions.find((opt) => opt.value === value);
              if (option) {
                if (option.value === "12038a33-aad2-47f8-8742-fd86defb2a85") {
                  setIsLoading(true);
                  router.push(
                    `/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/workflows/node-maker`
                  );
                } else {
                  setSelectedNodeOption(option);
                }
              }
            }}
            data={newOptions.map((option) => ({
              value: option.value,
              label: option.label,
              icon:
                option.value === "12038a33-aad2-47f8-8742-fd86defb2a85" ? (
                  <>
                    <IconSquareRoundedPlusFilled color="blue" size={18} />
                  </>
                ) : undefined,
            }))}
            nothingFound={
              <>
                <Button
                  fullWidth
                  variant="subtle"
                  onClick={() => {
                    setIsLoading(true);
                    router.push(
                      `/${formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      )}/workflows/node-maker`
                    );
                  }}
                  leftIcon={
                    <IconSquareRoundedPlusFilled color="blue" size={18} />
                  }
                >
                  Add New Node
                </Button>
              </>
            }
            itemComponent={SelectItem}
            sx={{ minWidth: 120 }}
            error={
              !selectedNodeOption ? "Please select a valid option" : undefined
            }
          />
          <Button
            variant="default"
            leftIcon={<IconPlus size={16} stroke={5} color="#141517" />}
            onClick={handleAddNodeClick}
          >
            Add Node
          </Button>

          <Button
            variant="default"
            leftIcon={<IconPlus size={16} stroke={5} color="#141517" />}
            onClick={handleAddNextNode}
          >
            Add Next Node
          </Button>
        </Flex>
      )}
      <Paper px={10} py={7} style={{ border: "0.0625rem solid #ced4da" }}>
        <Switch
          label="Transition Label"
          checked={showTransitionLabel}
          onLabel={<IconEye size={16} />}
          offLabel={<IconEyeClosed size={16} />}
          onChange={(event) =>
            onShowTransitionLabelChange(event.currentTarget.checked)
          }
          sx={{
            label: { cursor: "pointer" },
          }}
        />
      </Paper>
      {mode !== "view" ? (
        <Button
          ml="auto"
          sx={{ justifySelf: "flex-end" }}
          leftIcon={buttonIcon()}
          onClick={onSubmit}
        >
          {buttonText()}
        </Button>
      ) : (
        <Button
          ml="auto"
          sx={{ justifySelf: "flex-end" }}
          leftIcon={buttonIcon()}
          onClick={onSubmit}
        >
          {buttonText()}
        </Button>
      )}
    </Flex>
  );
};

export default WorkflowMenu;
