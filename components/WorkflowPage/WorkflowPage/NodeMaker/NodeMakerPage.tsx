import { deleteNodeType } from "@/backend/api/delete";
import { getNodeTypesOption } from "@/backend/api/get";
import {
  checkIfLabelIsBeingUsed,
  checkUniqueLabelNodeType,
  createNodeStyle,
} from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import { NodeOption, NodeTypeData } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  List,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import NodeForm from "./NodeForm";
import NodeTableView from "./NodeTableView";

const NodeMaker = () => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [nodeTypesList, setNodeTypesList] = useState<NodeOption[]>([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_REQUEST_LIST_LIMIT);

  const methods = useForm<NodeTypeData & { searchTerm: string }>({
    defaultValues: {
      presetLabel: "",
      presetBackgroundColor: "",
      presetTextColor: "",
      searchTerm: "",
    },
  });

  const { register, getValues, reset } = methods;

  const fetchNodeOptios = async (limit: number) => {
    try {
      if (!activeTeam.team_id) return;
      setIsLoading(true);
      const { searchTerm } = getValues();
      const { nodeData, count } = await getNodeTypesOption(supabaseClient, {
        activeTeam: activeTeam.team_id,
        limit: limit,
        page: 1,
        search: searchTerm,
      });

      setNodeCount(count);
      setNodeTypesList(nodeData);
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (limit: number) => {
    try {
      await fetchNodeOptios(limit);
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  useEffect(() => {
    handlePagination(limit);
  }, [activeTeam, limit]);

  const handleAction = (nodeId: string, nodeLabel: string) => {
    modals.open({
      modalId: "deleteNode",
      title: <Text>Please confirm your action.</Text>,
      children: (
        <>
          <Text size={14}>Are you sure you want to DELETE {nodeLabel} ?</Text>
          <Flex mt="md" align="center" justify="flex-end" gap="sm">
            <Button
              variant="default"
              color="dimmed"
              onClick={() => {
                modals.close("deleteNode");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="red"
              onClick={async () => {
                handleDeleteNode(nodeId);
              }}
            >
              Delete
            </Button>
          </Flex>
        </>
      ),
      centered: true,
    });
  };

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
      modals.close("deleteNode");
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

      reset();
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
        <Group pb="sm">
          <Box>
            <Title order={3}>Create Node Page</Title>
            <Text>Manage your nodes here.</Text>
          </Box>
        </Group>
        <Paper p="xl">
          <Stack>
            <Box>
              <FormProvider {...methods}>
                <NodeForm onSubmit={onSubmit} />
              </FormProvider>
            </Box>
            <Paper withBorder p="xl">
              <Stack>
                <Group position="right">
                  <TextInput
                    {...register("searchTerm")}
                    rightSection={
                      <ActionIcon onClick={() => handlePagination(limit)}>
                        <IconSearch size={16} />
                      </ActionIcon>
                    }
                    placeholder="Search node"
                  />
                </Group>
                <List>
                  {nodeTypesList.length === 0 ? (
                    <Alert
                      variant="light"
                      color="blue"
                      title="No Records"
                      icon={<IconAlertCircle size={16} />}
                    >
                      There is no available node in the system
                    </Alert>
                  ) : (
                    <ScrollArea h={700}>
                      <NodeTableView
                        isLoading={isLoading}
                        nodeTypesList={nodeTypesList}
                        handleAction={handleAction}
                      />
                      <Center>
                        {nodeCount >= limit && (
                          <Button
                            variant="light"
                            onClick={() => setLimit((prev) => prev + 10)}
                            w={120}
                          >
                            Load More
                          </Button>
                        )}
                      </Center>
                    </ScrollArea>
                  )}
                </List>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default NodeMaker;
