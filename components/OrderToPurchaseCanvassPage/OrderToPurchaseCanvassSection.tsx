import {
  Accordion,
  Box,
  Button,
  Center,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { IconFileAnalytics } from "@tabler/icons-react";
import { useRouter } from "next/router";
import RequestResponse from "../RequestPage/RequestResponse";

type Props = { canvassRequest: string[] };

const OrderToPurchaseCanvassSection = ({ canvassRequest }: Props) => {
  const router = useRouter();

  const canvassSection = canvassRequest.map((request) => {
    return (
      <Box key={request} mt={5}>
        <RequestResponse
          response={{
            id: request,
            type: "LINK",
            label: "",
            value: `"${request}"`,
            options: [],
          }}
          isFormslyForm={true}
        />
      </Box>
    );
  });

  return (
    <Paper p="xl" shadow="xs">
      <Accordion>
        <Accordion.Item value="customization">
          <Accordion.Control>
            <Title order={4} color="dimmed">
              Canvass
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack spacing="sm">{canvassSection}</Stack>
            <Center mt="md">
              <Button
                rightIcon={<IconFileAnalytics size={20} />}
                onClick={() =>
                  router.push(
                    `/team-requests/requests/${router.query.requestId}/canvass`
                  )
                }
              >
                Canvass
              </Button>
            </Center>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};

export default OrderToPurchaseCanvassSection;
