import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { JiraTicketData, TargetNode } from "@/utils/types";
import { Button, Flex, Paper, Space, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  handleCancelRequest: () => void;
  openPromptDeleteModal: () => void;
  handleUpdateRequest: (
    status: string,
    action: string,
    jiraId?: string,
    jiraLink?: string
  ) => void;
  targetNodes: TargetNode[];
  isItemForm?: boolean;
  isUserPrimarySigner?: boolean;
  requestId?: string;
  isEditable: boolean;
  isCancelable: boolean;
  isSectionHidden?: boolean;
  canSignerTakeAction?: boolean;
  isDeletable: boolean;
  isTeamGroup?: boolean;
  onCreateJiraTicket?: () => Promise<JiraTicketData>;
  requestSignerId?: string;
};

const ModuleRequestActionSection = ({
  openPromptDeleteModal,
  handleUpdateRequest,
  isEditable,
  isCancelable,
  targetNodes,
  isSectionHidden,
  canSignerTakeAction,
  isDeletable,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const [isLoading] = useState(false);

  const handleAction = (
    action: string,
    color: string,
    fontColor: string,
    callback: () => void
  ) => {
    modals.open({
      modalId: "approveRf",
      title: <Text>Please confirm your action.</Text>,
      children: (
        <>
          <Text size={14}>Are you sure you want to {action} this request?</Text>
          <Flex mt="md" align="center" justify="flex-end" gap="sm">
            <Button
              variant="default"
              color="dimmed"
              onClick={() => {
                modals.close("approveRf");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              styles={{
                root: {
                  backgroundColor: color,
                  color: fontColor,
                  "&:hover": {
                    backgroundColor: color,
                  },
                },
              }}
              onClick={async () => {
                modals.close("approveRf");
                callback();
              }}
            >
              {action}
            </Button>
          </Flex>
        </>
      ),
      centered: true,
    });
  };
  const handleButtonClick = (
    index: number,
    nodeTypeLabel: string,
    edgeTransitionLabel: string,
    color: string,
    fontColor: string
  ) => {
    handleAction(edgeTransitionLabel, color, fontColor, () => {
      handleUpdateRequest(nodeTypeLabel, edgeTransitionLabel);
    });
  };

  return !isSectionHidden ? (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Request Action
      </Title>
      <Space h="xl" />
      <Stack>
        {canSignerTakeAction && (
          <>
            {targetNodes.map(
              (node, index) =>
                node.edge_transition_label !== "" && (
                  <Button
                    key={index}
                    variant="default"
                    fullWidth
                    styles={{
                      root: {
                        backgroundColor: node.target_node_background_color,
                        color: node.target_node_font_color,
                        "&:hover": {
                          backgroundColor: node.target_node_background_color,
                        },
                      },
                    }}
                    disabled={isLoading}
                    onClick={() =>
                      handleButtonClick(
                        index,
                        node.target_node_type_label,
                        node.edge_transition_label,
                        node.target_node_background_color,
                        node.target_node_font_color
                      )
                    }
                  >
                    {node.edge_transition_label}
                  </Button>
                )
            )}
          </>
        )}

        {isEditable && (
          <Button
            variant="outline"
            fullWidth
            onClick={async () =>
              await router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/requests/${router.query.requestId}/edit`
              )
            }
            disabled={isLoading}
          >
            Edit Request
          </Button>
        )}
        {isCancelable && (
          <Button variant="default" fullWidth disabled={isLoading}>
            Cancel Request
          </Button>
        )}
        {isDeletable && (
          <Button
            color="red"
            fullWidth
            onClick={openPromptDeleteModal}
            disabled={isLoading}
          >
            Delete Request
          </Button>
        )}
      </Stack>
    </Paper>
  ) : null;
};

export default ModuleRequestActionSection;
