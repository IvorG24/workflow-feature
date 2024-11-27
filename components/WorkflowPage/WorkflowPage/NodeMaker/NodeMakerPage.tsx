import { deleteNodeType } from "@/backend/api/delete";
import {
  checkIfLabelIsBeingUsed,
  checkUniqueLabelNodeType,
  createNodeStyle,
} from "@/backend/api/post";
import { useLoadingActions, useLoadingStore } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { NodeOption, NodeTypeData } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Flex,
  Group,
  List,
  LoadingOverlay,
  Menu,
  Paper,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconDotsVertical,
  IconMoodSad,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import NodeForm from "./NodeForm";

type Props = {
  nodeTypes: NodeOption[];
};
const NodeMaker = ({ nodeTypes: initialList }: Props) => {
  const { isLoading } = useLoadingStore();
  const { setIsLoading } = useLoadingActions();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [nodeTypesList, setNodeTypesList] = useState<NodeOption[]>(initialList);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const methods = useForm<NodeTypeData>({
    defaultValues: {
      presetLabel: "",
      presetBackgroundColor: "",
      presetTextColor: "",
    },
  });
  const filteredNodeTypesList = nodeTypesList.filter((node) =>
    node.presetLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const listItems = filteredNodeTypesList.map((nodes) => (
    <List
      key={nodes.value}
      style={{
        padding: "10px 0",
        borderBottom: "1px solid #ddd",
        listStyleType: "none",
      }}
    >
      <Flex align="end" justify="space-between">
        <Tooltip label={`${nodes.presetLabel}`}>
          <Text weight={500} style={{ marginRight: "16px", minWidth: "100px" }}>
            {nodes.presetLabel.length > 10
              ? `${nodes.presetLabel.slice(0, 10)}...`
              : nodes.presetLabel}
          </Text>
        </Tooltip>

        <Flex align="center" style={{ marginRight: "16px" }}>
          <Tooltip label={`Preview of ${nodes.presetLabel}`}>
            <Button
              fullWidth
              style={{
                width: "150px",
                height: "40px",
                backgroundColor: nodes.presetBackgroundColor,
                color: nodes.presetTextColor,
                border: "1px solid #ddd",
              }}
            >
              {nodes.presetLabel.length > 10
                ? `${nodes.presetLabel.slice(0, 10)}...`
                : nodes.presetLabel}
            </Button>
          </Tooltip>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon size={18}>
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconTrash size={16} color="red" />}
                onClick={async () => await handleDeleteNode(nodes.value)}
              >
                Delete node
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </List>
  ));

  const handleDeleteNode = async (nodeId: string) => {
    try {
      const isNodeBeingUsed = await checkIfLabelIsBeingUsed(supabaseClient, {
        nodeTypeId: nodeId,
      });
      if (!isNodeBeingUsed) {
        notifications.show({
          message: "Node exist in a workflow, cannot be deleted",
          color: "orange",
        });
        return;
      }

      await deleteNodeType(supabaseClient, nodeId);
      setNodeTypesList((prev) => prev.filter((node) => node.value !== nodeId));
      notifications.show({
        message: "Node deleted successfully",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "orange",
      });
    }
  };
  const onSubmit = async (data: NodeTypeData) => {
    setIsLoading(true);
    try {
      const isUnique = await checkUniqueLabelNodeType(supabaseClient, {
        label: data.presetLabel,
      });

      if (!isUnique) {
        notifications.show({
          message: "Label already exists. Please choose a different label.",
          color: "orange",
        });
        setIsLoading(false);
        return;
      }

      const createNode = await createNodeStyle(supabaseClient, {
        label: data.presetLabel,
        backgroundColor: data.presetBackgroundColor,
        fontColor: data.presetTextColor,
        activeTeamID: activeTeam.team_id,
      });

      setNodeTypesList((prev) => [
        {
          value: createNode.id,
          label: data.presetLabel,
          type: "basic",
          presetLabel: data.presetLabel,
          presetBackgroundColor: data.presetBackgroundColor,
          presetTextColor: data.presetTextColor,
        },
        ...prev,
      ]);
      notifications.show({
        message: "Node created successfully",
        color: "green",
      });
      methods.reset();
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "orange",
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Container size={"xl"}>
        <LoadingOverlay
          visible={isLoading}
          overlayBlur={2}
          sx={{ position: "fixed" }}
        />
        <Group pb="sm">
          <Box>
            <Title order={4}>Create node page</Title>
            <Text>Manage your nodes here.</Text>
          </Box>
        </Group>
        <Paper
          withBorder
          h={780}
          pos="relative"
          sx={{ overflow: "hidden", padding: "20px" }}
        >
          <Flex align={"flex-start"} justify={"space-between"} wrap="wrap">
            <Box sx={{ flex: "1 1 300px", maxWidth: "45%", minWidth: "300px" }}>
              <FormProvider {...methods}>
                <NodeForm onSubmit={onSubmit} />
              </FormProvider>
            </Box>
            <Box
              sx={{
                flex: "1 1 300px",
                maxWidth: "50%",
                minWidth: "300px",
                height: "450px",
                maxHeight: "430px",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <Flex justify={"space-between"} align={"center"} pb={10}>
                <Title color="blue" order={4}>
                  List of nodes
                </Title>
                <TextInput
                  rightSection={<IconSearch size={12} />}
                  placeholder="Search node"
                  size="xs"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                />
              </Flex>
              <List
                style={{
                  listStyleType: "none",
                  padding: 0,
                  ...(filteredNodeTypesList.length === 0
                    ? {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }
                    : {}),
                }}
              >
                {filteredNodeTypesList.length === 0 ? (
                  <Flex direction={"column"} align={"center"}>
                    <Text color="gray">No Nodes Found</Text>
                    <IconMoodSad stroke={".7px"} color="gray" size={40} />
                  </Flex>
                ) : (
                  listItems // Render listItems directly here
                )}
              </List>
            </Box>
          </Flex>
        </Paper>
      </Container>
    </>
  );
};

export default NodeMaker;
