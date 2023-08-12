import { requestPath } from "@/utils/string";
import { ConnectedRequestItemType } from "@/utils/types";
import {
  Accordion,
  ActionIcon,
  Box,
  Flex,
  Paper,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { isEmpty } from "lodash";

type Props = {
  connectedRequestIDList: { [key: string]: ConnectedRequestItemType[] };
};

const renderLink = (request: ConnectedRequestItemType) => {
  const inputProps = {
    variant: "filled",
    readOnly: true,
  };

  return (
    <Flex w="100%" align="flex-end" gap="xs">
      <TextInput
        value={request.request_formsly_id}
        {...inputProps}
        style={{ flex: 1 }}
      />
      <ActionIcon
        mb={4}
        p={4}
        variant="light"
        color="blue"
        onClick={() => window.open(requestPath(request.request_id), "_blank")}
      >
        <IconExternalLink />
      </ActionIcon>
    </Flex>
  );
};

const ConnectedRequestSection = ({ connectedRequestIDList }: Props) => {
  const formTypeList = Object.keys(connectedRequestIDList);

  const connectedRequestSection = formTypeList.map((key) => {
    return connectedRequestIDList[key].length !== 0 ? (
      <Box key={key} mt="xs">
        <Title order={5}>{key}</Title>
        {connectedRequestIDList[key].map((request) => (
          <Box key={request.request_id} mt={5}>
            {renderLink(request)}
          </Box>
        ))}
      </Box>
    ) : null;
  });

  if (isEmpty(connectedRequestSection.filter((request) => request !== null)))
    return null;

  return (
    <Paper p="xl" shadow="xs">
      <Accordion>
        <Accordion.Item value="customization">
          <Accordion.Control>
            <Title order={4} color="dimmed">
              Connected Request/s
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack spacing="sm">{connectedRequestSection}</Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};

export default ConnectedRequestSection;
