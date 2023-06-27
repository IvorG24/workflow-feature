import { SSOTType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Flex,
  List,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { IconFile } from "@tabler/icons-react";

// TODO: Refactor

const useStyles = createStyles(() => ({
  cell: {
    verticalAlign: "top",
  },
  date: {
    width: 120,
    minWidth: 120,
    maxWidth: 120,
  },
  processor: {
    width: 180,
    minWidth: 180,
    maxWidth: 180,
  },
  short: {
    width: 80,
    minWidth: 80,
    maxWidth: 80,
  },
  normal: {
    width: 100,
    minWidth: 100,
    maxWidth: 100,
  },
  long: {
    width: 200,
    minWidth: 200,
    maxWidth: 200,
  },
  description: {
    width: 300,
    minWidth: 300,
    maxWidth: 300,
  },
}));

type Props = {
  data: SSOTType[];
};

const SSOTSpreadsheetView = ({ data }: Props) => {
  const { classes } = useStyles();

  const renderRir = (
    request: SSOTType["otp_quotation_request"][0]["quotation_rir_request"]
  ) => {
    return request.map((request) => {
      return (
        <tr
          key={request.rir_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          <td>{request.rir_request_id}</td>
          <td>
            {new Date(request.rir_request_date_created).toLocaleDateString()}
          </td>
          <td>{`${request.rir_request_owner.user_first_name} ${request.rir_request_owner.user_last_name}`}</td>
          <td>
            {JSON.parse(request.rir_request_response[2].request_response)}
          </td>
        </tr>
      );
    });
  };

  const renderQuotation = (request: SSOTType["otp_quotation_request"]) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemPrice: string[] = [];
      const itemQuantity: string[] = [];
      const items = request.quotation_request_response.slice(
        3,
        request.quotation_request_response.length
      );
      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          itemName.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Price") {
          itemPrice.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Quantity") {
          itemQuantity.push(JSON.parse(item.request_response));
        }
      });

      return (
        <tr
          key={request.quotation_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          <td>{request.quotation_request_id}</td>
          <td>
            {new Date(
              request.quotation_request_date_created
            ).toLocaleDateString()}
          </td>
          <td>{`${request.quotation_request_owner.user_first_name} ${request.quotation_request_owner.user_last_name}`}</td>
          {request.quotation_request_response
            .slice(1, 5)
            .map((response, index) => {
              return (
                <td key={index}>
                  {response.request_response_field_type === "DATE" ? (
                    new Date(
                      JSON.parse(response.request_response)
                    ).toLocaleDateString()
                  ) : response.request_response_field_type === "FILE" ? (
                    <ActionIcon
                      w="100%"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `${JSON.parse(response.request_response)}`,
                          "_blank"
                        )
                      }
                    >
                      <Flex align="center" justify="center" gap={2}>
                        <Text size={14}>File</Text> <IconFile size={14} />
                      </Flex>
                    </ActionIcon>
                  ) : (
                    JSON.parse(response.request_response)
                  )}
                </td>
              );
            })}
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemPrice.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.quotation_rir_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table withBorder withColumnBorders h="100%">
                <thead style={{ backgroundColor: "#4DABF7" }}>
                  <tr>
                    <th className={classes.long}>RIR ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Warehouse Receiver</th>
                    <th className={classes.normal}>Receiving Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "#E7F5FF" }}>
                  {renderRir(request.quotation_rir_request)}
                </tbody>
              </Table>
            </td>
          ) : null}
        </tr>
      );
    });
  };

  const renderOtp = () => {
    return data.map((request) => {
      const itemName: string[] = [];
      const itemUnit: string[] = [];
      const itemQuantity: string[] = [];
      const itemDescription: string[] = [];
      const items = request.otp_request_response.slice(
        3,
        request.otp_request_response.length
      );
      items.forEach((item) => {
        if (item.request_response_field_name === "General Name") {
          itemName.push(JSON.parse(item.request_response));
          itemDescription.push("");
          if (itemDescription.length !== 1) {
            itemDescription[itemDescription.length - 2] = itemDescription[
              itemDescription.length - 2
            ].slice(0, -2);
          }
        } else if (item.request_response_field_name === "Unit") {
          itemUnit.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Quantity") {
          itemQuantity.push(JSON.parse(item.request_response));
        } else {
          itemDescription[itemName.length - 1] += `${
            item.request_response_field_name
          }: ${JSON.parse(item.request_response)}, `;
        }
      });
      itemDescription[itemDescription.length - 1] = itemDescription[
        itemDescription.length - 1
      ].slice(0, -2);
      return (
        <tr key={request.otp_request_id} className={classes.cell}>
          <td>{request.otp_request_id}</td>
          <td>
            {new Date(request.otp_request_date_created).toLocaleDateString()}
          </td>
          <td>{`${request.otp_request_owner.user_first_name} ${request.otp_request_owner.user_last_name}`}</td>
          {request.otp_request_response.slice(0, 4).map((response, index) => {
            return (
              <td key={index}>
                {response.request_response_field_type === "DATE"
                  ? new Date(
                      JSON.parse(response.request_response)
                    ).toLocaleDateString()
                  : JSON.parse(response.request_response)}
              </td>
            );
          })}
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemUnit.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemDescription.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.otp_quotation_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table withBorder withColumnBorders h="100%">
                <thead style={{ backgroundColor: "#E599F7" }}>
                  <tr>
                    <th className={classes.long}>Quotation ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Accounting Processor</th>
                    <th className={classes.long}>Supplier</th>
                    <th className={classes.normal}>Supplier Quotation</th>
                    <th className={classes.short}> Send Method</th>
                    <th className={classes.normal}>Proof of Sending</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.short}>Price</th>
                    <th className={classes.short}>Quantity</th>
                    <th>RIR</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "#F8F0FC" }}>
                  {renderQuotation(request.otp_quotation_request)}
                </tbody>
              </Table>
            </td>
          ) : null}
        </tr>
      );
    });
  };

  return (
    <Flex direction="column" p="xl">
      <Title order={2} color="dimmed">
        SSOT Spreadsheet View
      </Title>

      <Paper mt="xl" p="xl" shadow="sm">
        <ScrollArea scrollbarSize={10}>
          <Box mah={710}>
            <Table withBorder withColumnBorders pos="relative" h="100%">
              <thead style={{ backgroundColor: "#FFA8A8" }}>
                <tr>
                  <th className={classes.long}>OTP ID</th>
                  <th className={classes.date}>Date Created</th>
                  <th className={classes.processor}>Warehouse Processor</th>
                  <th className={classes.long}>Project Name</th>
                  <th className={classes.normal}>Type</th>
                  <th className={classes.date}>Date Needed</th>
                  <th className={classes.normal}>Cost Code</th>
                  <th className={classes.normal}>Item Name</th>
                  <th className={classes.short}>Quantity</th>
                  <th className={classes.short}>Unit</th>
                  <th className={classes.description}>Description</th>
                  <th>Quotation</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: "#FFF5F5" }}>
                {renderOtp()}
              </tbody>
            </Table>
          </Box>
        </ScrollArea>
      </Paper>
    </Flex>
  );
};

export default SSOTSpreadsheetView;
