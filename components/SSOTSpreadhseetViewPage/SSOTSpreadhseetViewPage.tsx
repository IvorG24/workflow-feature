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
}));

type Props = {
  data: SSOTType[];
};

const SSOTSpreadsheetView = ({ data }: Props) => {
  const { classes } = useStyles();

  const renderRir = (
    request: SSOTType["otp_quotation_request"][0]["quotation_apv_request"][0]["apv_rir_request"]
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
            {JSON.parse(request.rir_request_response[3].request_response)}
          </td>
        </tr>
      );
    });
  };

  const renderApv = (
    request: SSOTType["otp_quotation_request"][0]["quotation_apv_request"]
  ) => {
    return request.map((request) => {
      return (
        <tr
          key={request.apv_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          <td>{request.apv_request_id}</td>
          <td>
            {new Date(request.apv_request_date_created).toLocaleDateString()}
          </td>
          <td>{`${request.apv_request_owner.user_first_name} ${request.apv_request_owner.user_last_name}`}</td>
          {request.apv_request_response.slice(0, 2).map((response, index) => {
            return <td key={index}>{JSON.parse(response.request_response)}</td>;
          })}

          {request.apv_rir_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table withBorder withColumnBorders>
                <thead style={{ backgroundColor: "#69DB7C" }}>
                  <tr>
                    <th style={{ minWidth: 200 }}>RIR ID</th>
                    <th style={{ minWidth: 100 }}>Date Created</th>
                    <th style={{ minWidth: 200 }}>Warehouse Receiver</th>
                    <th>Receiving Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "#EBFBEE" }}>
                  {renderRir(request.apv_rir_request)}
                </tbody>
              </Table>
            </td>
          ) : null}
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
            <List sx={{ listStyle: "none" }}>
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }}>
              {itemPrice.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }}>
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.quotation_apv_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table withBorder withColumnBorders>
                <thead style={{ backgroundColor: "#4DABF7" }}>
                  <tr>
                    <th style={{ minWidth: 200 }}>APV ID</th>
                    <th style={{ minWidth: 100 }}>Date Created</th>
                    <th>Requestor</th>
                    <th style={{ minWidth: 200 }}>OTP ID</th>
                    <th style={{ minWidth: 200 }}>Quotation ID</th>
                    <th>RIR</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "#E7F5FF" }}>
                  {renderApv(request.quotation_apv_request)}
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
          {request.otp_request_response.slice(0, 3).map((response, index) => {
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
            <List sx={{ listStyle: "none" }}>
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }}>
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }}>
              {itemDescription.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.otp_quotation_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table withBorder withColumnBorders>
                <thead style={{ backgroundColor: "#E599F7" }}>
                  <tr>
                    <th style={{ minWidth: 200 }}>Quotation ID</th>
                    <th style={{ minWidth: 100 }}>Date Created</th>
                    <th style={{ minWidth: 200 }}>Accounting Processor</th>
                    <th style={{ minWidth: 300 }}>Supplier</th>
                    <th>Supplier Quotation</th>
                    <th>Request Send Method</th>
                    <th>Proof of Sending</th>
                    <th style={{ minWidth: 400 }}>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>APV</th>
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
    <Box p="xl">
      <Title>SSOT Spreadsheet View</Title>
      <ScrollArea type="auto" offsetScrollbars scrollbarSize={5}>
        <Paper mt="xl">
          <Table withBorder withColumnBorders>
            <thead style={{ backgroundColor: "#FFA8A8" }}>
              <tr>
                <th style={{ minWidth: 200 }}>OTP ID</th>
                <th style={{ minWidth: 100 }}>Date Created</th>
                <th style={{ minWidth: 150 }}>Warehouse Processor</th>
                <th>Project Name</th>
                <th>Type</th>
                <th style={{ minWidth: 100 }}>Date Needed</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th style={{ minWidth: 400 }}>Description</th>
                <th>Quotation</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "#FFF5F5" }}>{renderOtp()}</tbody>
          </Table>
        </Paper>
      </ScrollArea>
    </Box>
  );
};

export default SSOTSpreadsheetView;
