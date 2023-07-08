import { addCommaToNumber, regExp } from "@/utils/string";
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

const useStyles = createStyles((theme) => ({
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
  otpTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[6]
          : theme.colors.red[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[9]
          : theme.colors.red[0],
    },
  },
  quotationTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.grape[6]
          : theme.colors.grape[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.grape[9]
          : theme.colors.grape[0],
    },
  },
  rirTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[6]
          : theme.colors.blue[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[9]
          : theme.colors.blue[0],
    },
  },
  chequeReferenceTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.green[6]
          : theme.colors.green[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.green[9]
          : theme.colors.green[0],
    },
  },
}));

type Props = {
  data: SSOTType[];
};

const SSOTSpreadsheetView = ({ data }: Props) => {
  const { classes } = useStyles();

  const renderChequeReference = (
    request: SSOTType["otp_cheque_reference_request"]
  ) => {
    return request.map((request) => {
      return (
        <tr
          key={request.cheque_reference_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          <td>{request.cheque_reference_request_id}</td>
          <td>
            {new Date(
              request.cheque_reference_request_date_created
            ).toLocaleDateString()}
          </td>
          <td>{`${request.cheque_reference_request_owner.user_first_name} ${request.cheque_reference_request_owner.user_last_name}`}</td>
          {request.cheque_reference_request_response
            .slice(1)
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
                    `${JSON.parse(response.request_response)}`
                  )}
                </td>
              );
            })}
        </tr>
      );
    });
  };

  const renderRir = (
    request: SSOTType["otp_quotation_request"][0]["quotation_rir_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemStatus: string[] = [];
      const items = request.rir_request_response;

      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        } else if (item.request_response_field_name === "Receiving Status") {
          itemStatus.push(JSON.parse(item.request_response));
        }
      });

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
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
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
              {itemStatus.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
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
      const itemUnit: string[] = [];
      const items = request.quotation_request_response.slice(
        3,
        request.quotation_request_response.length
      );
      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Price per Unit") {
          itemPrice.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
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
            .slice(1, 3)
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
            {request.quotation_request_response[3]
              .request_response_field_name === "Request Send Method" &&
              JSON.parse(
                request.quotation_request_response[3].request_response
              )}
          </td>
          <td>
            {request.quotation_request_response[4]
              .request_response_field_name === "Proof of Sending" && (
              <ActionIcon
                w="100%"
                variant="outline"
                onClick={() =>
                  window.open(
                    `${JSON.parse(
                      request.quotation_request_response[4].request_response
                    )}`,
                    "_blank"
                  )
                }
              >
                <Flex align="center" justify="center" gap={2}>
                  <Text size={14}>File</Text> <IconFile size={14} />
                </Flex>
              </ActionIcon>
            )}
          </td>
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
                  <Text size={14}>₱ {addCommaToNumber(Number(item))}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
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
          {request.quotation_rir_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.rirTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>RIR ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Warehouse Receiver</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.normal}>Quantity</th>
                    <th className={classes.normal}>Unit</th>
                    <th className={classes.long}>Receiving Status</th>
                  </tr>
                </thead>
                <tbody>{renderRir(request.quotation_rir_request)}</tbody>
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
      const itemCostCode: string[] = [];
      const itemGlAccount: string[] = [];
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
        } else if (item.request_response_field_name === "Unit of Measurement") {
          itemUnit.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Quantity") {
          itemQuantity.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Cost Code") {
          itemCostCode.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "GL Account") {
          itemGlAccount.push(JSON.parse(item.request_response));
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
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
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
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemCostCode.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemGlAccount.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.otp_quotation_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.quotationTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>Quotation ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Accounting Processor</th>
                    <th className={classes.long}>Supplier</th>
                    <th className={classes.normal}>Supplier Quotation</th>
                    <th className={classes.short}> Send Method</th>
                    <th className={classes.normal}>Proof of Sending</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.normal}>Price per Unit</th>
                    <th className={classes.normal}>Quantity</th>
                    <th className={classes.date}>Unit of Measurement</th>
                    <th>RIR</th>
                  </tr>
                </thead>
                <tbody>{renderQuotation(request.otp_quotation_request)}</tbody>
              </Table>
            </td>
          ) : null}
          {request.otp_cheque_reference_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.chequeReferenceTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>Cheque Reference ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Treasury Processor</th>
                    <th className={classes.normal}>Treasury Status</th>
                    <th className={classes.short}>Cheque Cancelled</th>
                    <th className={classes.date}>Cheque Printed Date</th>
                    <th className={classes.date}>Cheque Clearing Date</th>
                    <th className={classes.processor}>
                      Cheque First Signatory Name
                    </th>
                    <th className={classes.date}>Cheque First Date Signed</th>
                    <th className={classes.processor}>
                      Cheque Second Signatory Name
                    </th>
                    <th className={classes.date}>Cheque Second Date Signed</th>
                  </tr>
                </thead>
                <tbody>
                  {renderChequeReference(request.otp_cheque_reference_request)}
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
        <ScrollArea scrollbarSize={10} offsetScrollbars type="always">
          <Box mah={710}>
            <Table
              withBorder
              withColumnBorders
              pos="relative"
              h="100%"
              className={classes.otpTable}
            >
              <thead>
                <tr>
                  <th className={classes.long}>OTP ID</th>
                  <th className={classes.date}>Date Created</th>
                  <th className={classes.processor}>Warehouse Processor</th>
                  <th className={classes.long}>Project Name</th>
                  <th className={classes.normal}>Type</th>
                  <th className={classes.date}>Date Needed</th>
                  <th className={classes.normal}>Cost Code</th>
                  <th className={classes.normal}>Item Name</th>
                  <th className={classes.normal}>Quantity</th>
                  <th className={classes.date}>Unit of Measurement</th>
                  <th className={classes.description}>Description</th>
                  <th className={classes.short}>Cost Code</th>
                  <th className={classes.short}>GL Account</th>
                  <th>Quotation</th>
                  <th>Cheque Reference</th>
                </tr>
              </thead>
              <tbody>{renderOtp()}</tbody>
            </Table>
          </Box>
        </ScrollArea>
      </Paper>
    </Flex>
  );
};

export default SSOTSpreadsheetView;
