import { addCommaToNumber, requestPath } from "@/utils/string";
import { CanvassLowestPriceType, CanvassType } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { IconAlertCircle, IconExternalLink } from "@tabler/icons-react";
import { useRouter } from "next/router";
import RequestResponse from "../RequestPage/RequestResponse";

const useStyles = createStyles((theme) => ({
  lowestPrice: {
    backgroundColor:
      theme.colorScheme === "light"
        ? theme.colors.blue[1]
        : theme.colors.blue[8],
  },
}));

type Props = {
  canvassData: CanvassType;
  lowestPricePerItem: CanvassLowestPriceType;
  summaryData: CanvassLowestPriceType;
  lowestQuotation: { id: string; value: number };
};

const OrderToPurchaseCanvassPage = ({
  canvassData,
  lowestPricePerItem,
  summaryData,
  lowestQuotation,
}: Props) => {
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <Container>
      <Title order={2} color="dimmed">
        Canvass
      </Title>
      <Paper p="xl" shadow="xs" mt="xl">
        <RequestResponse
          response={{
            id: `${router.query.requestId}`,
            type: "LINK",
            label: "OTP ID",
            value: `"${router.query.requestId}"`,
            options: [],
          }}
          isFormslyForm={true}
        />
        <Alert title="Recommended Quotation" mt="xl" icon={<IconAlertCircle />}>
          <Group>
            <Title order={6}>Quotation ID: </Title>
            <Text>{lowestQuotation.id}</Text>
          </Group>
          <Group>
            <Title order={6}>Total Price: </Title>
            <Text>₱{addCommaToNumber(lowestQuotation.value)}</Text>
          </Group>
          <Center>
            <Button
              variant="light"
              onClick={() =>
                window.open(requestPath(lowestQuotation.id), "_blank")
              }
            >
              View Quotation
            </Button>
          </Center>
        </Alert>
      </Paper>

      <Paper p="xl" shadow="xs" mt="xl">
        <Title order={5} color="dimmed">
          Summary
        </Title>
        <Table withBorder withColumnBorders striped highlightOnHover mt="xl">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Total Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(summaryData).map((quotationID) => {
              return (
                <tr key={quotationID}>
                  <td>{quotationID}</td>
                  <td>₱{addCommaToNumber(summaryData[quotationID])}</td>
                  <td>
                    <Center>
                      <ActionIcon
                        mb={4}
                        p={4}
                        variant="light"
                        color="blue"
                        onClick={() =>
                          window.open(requestPath(quotationID), "_blank")
                        }
                      >
                        <IconExternalLink />
                      </ActionIcon>
                    </Center>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Paper>

      <Stack mt="xl">
        {Object.keys(canvassData).map((item) => {
          return (
            <Paper key={item} p="xl" shadow="xs">
              <Title order={5} color="dimmed">
                {item}
              </Title>
              <Table
                withBorder
                withColumnBorders
                striped
                highlightOnHover
                mt="xl"
              >
                <thead>
                  <tr>
                    <th>Quotation ID</th>
                    <th>Unit Cost</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {canvassData[item].map((itemData, index) => {
                    return (
                      <tr key={index}>
                        <td>{itemData.quotationId}</td>
                        <td
                          className={
                            lowestPricePerItem[item] === itemData.price
                              ? classes.lowestPrice
                              : ""
                          }
                        >
                          ₱{addCommaToNumber(itemData.price)}
                        </td>
                        <td>{addCommaToNumber(itemData.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
};

export default OrderToPurchaseCanvassPage;
