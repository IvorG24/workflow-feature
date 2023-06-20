import { FormslyFormKeyType, FormslyFormType } from "@/utils/types";
import { Accordion, Box, Paper, Stack, Title } from "@mantine/core";
import { isEmpty } from "lodash";
import RequestResponse from "./RequestResponse";

type Props = {
  connectedRequestIDList: FormslyFormType;
};

const ConnectedRequestSection = ({ connectedRequestIDList }: Props) => {
  const formTypeList = Object.keys(connectedRequestIDList);

  const connectedRequestSection = formTypeList.map((key) => {
    return connectedRequestIDList[key as FormslyFormKeyType].length !== 0 ? (
      <Box key={key} mt="xs">
        <Title order={5}>{key}</Title>
        {connectedRequestIDList[key as FormslyFormKeyType].map((request) => (
          <Box key={request} mt={5}>
            <RequestResponse
              response={{
                id: request,
                type: "LINK",
                label: "",
                value: request,
                options: [],
              }}
              isFormslyForm={true}
            />
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
