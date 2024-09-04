import { ApiKeyData } from "@/utils/types";
import {
  ActionIcon,
  Button,
  CopyButton,
  Flex,
  PasswordInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCopy, IconTrash } from "@tabler/icons-react";
type Props = {
  apiKeyData: ApiKeyData[];
  handleDeleteApiKey: (apiKey: string) => void;
  toggleVisibility: (apiKey: string) => void;
  visibleKeys: Record<string, boolean>;
};
const ApiKeyDetails = ({
  apiKeyData,
  handleDeleteApiKey,
  toggleVisibility,
  visibleKeys,
}: Props) => {
  const handleAction = (apiKey: string, apiLabel: string) => {
    modals.open({
      modalId: "deleteApiKey",
      title: <Text>Please confirm your action.</Text>,
      children: (
        <>
          <Text size={14}>
            Are you sure you want to DELETE {apiLabel} API Key?
          </Text>
          <Flex mt="md" align="center" justify="flex-end" gap="sm">
            <Button
              variant="default"
              color="dimmed"
              onClick={() => {
                modals.close("deleteApiKey");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="red"
              onClick={async () => {
                modals.close("deleteApiKey");
                handleDeleteApiKey(apiKey);
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
  return (
    <>
      {apiKeyData &&
        apiKeyData.map((api) => (
          <Flex key={api.team_key_api_key} gap={6} align="end">
            <PasswordInput
              label={`${api.team_key_label.toUpperCase()} API KEY`}
              variant="filled"
              readOnly
              defaultValue={api.team_key_api_key || ""}
              visible={visibleKeys[api.team_key_api_key] || false}
              onVisibilityChange={() => toggleVisibility(api.team_key_api_key)}
              style={{ flexGrow: 1 }}
            />

            <CopyButton value={api.team_key_api_key}>
              {({ copied, copy }) => (
                <Tooltip label={api.team_key_label}>
                  <Button
                    leftIcon={<IconCopy size={16} />}
                    color={copied ? "teal" : "blue"}
                    onClick={copy}
                  >
                    {copied ? "Copied API Key" : `Copy API Key`}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>

            <Tooltip label={`Delete ${api.team_key_label} API Key`}>
              <ActionIcon
                size={"lg"}
                color="red"
                variant="filled"
                onClick={() =>
                  handleAction(api.team_key_api_key, api.team_key_label)
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        ))}
    </>
  );
};

export default ApiKeyDetails;
