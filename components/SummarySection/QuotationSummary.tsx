import { addCommaToNumber, regExp } from "@/utils/string";
import { DuplicateSectionType, RequestWithResponseType } from "@/utils/types";
import {
  Alert,
  Center,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";

type Props = {
  summaryData: DuplicateSectionType[];
  additionalChargeData: RequestWithResponseType["request_form"]["form_section"][0]["section_field"];
};

const QuotationSummary = ({ summaryData, additionalChargeData }: Props) => {
  let totalItemPrice = 0;
  let totalAdditionalChargePrice = 0;

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Summary
      </Title>

      <ScrollArea>
        <Table
          mt="md"
          highlightOnHover
          withColumnBorders
          withBorder
          sx={(theme) => ({
            "& th": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.blue[9]
                  : theme.colors.blue[2],
            },
          })}
          miw={600}
        >
          <thead>
            <tr>
              <th>Item</th>
              <th>Price per Unit</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const quantityMatch =
                summary.section_field[0].field_response?.request_response.match(
                  /(\d+)/
                );
              if (!quantityMatch) return;

              const item =
                summary.section_field[0].field_response?.request_response.replace(
                  `${quantityMatch[0]}`,
                  addCommaToNumber(Number(quantityMatch[0]))
                );
              if (!item) return;

              const price = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const parsedQuantity = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );
              const matches = regExp.exec(item);
              const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

              const totalPrice = parsedQuantity * price;
              totalItemPrice += totalPrice;

              return (
                <tr key={index}>
                  <td>{JSON.parse(item)}</td>
                  <td>₱ {addCommaToNumber(price)}</td>
                  <td>{addCommaToNumber(parsedQuantity)}</td>
                  <td>{unit}</td>
                  <td>₱ {addCommaToNumber(totalPrice)}</td>
                </tr>
              );
            })}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <Text fw={700} sx={{ whiteSpace: "nowrap" }}>
                  ₱ {addCommaToNumber(totalItemPrice)}
                </Text>
              </td>
            </tr>
          </tbody>
        </Table>
      </ScrollArea>

      {additionalChargeData.length !== 0 ? (
        <>
          <ScrollArea>
            <Table
              mt="md"
              highlightOnHover
              withColumnBorders
              withBorder
              sx={(theme) => ({
                "& th": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.blue[9]
                      : theme.colors.blue[2],
                },
              })}
              miw={600}
            >
              <thead>
                <tr>
                  <th>Additional Charge</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {additionalChargeData.map((charge, index) => {
                  const price = Number(
                    charge.field_response[0].request_response
                  );
                  totalAdditionalChargePrice += price;
                  return (
                    <tr key={index}>
                      <td>{charge.field_name}</td>
                      <td>₱ {addCommaToNumber(price)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td>
                    <Text fw={700} sx={{ whiteSpace: "nowrap" }}>
                      ₱ {addCommaToNumber(totalAdditionalChargePrice)}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </Table>
          </ScrollArea>

          <Alert
            title="Total Price of Item with Additional Charge"
            mt="xl"
            icon={<IconReportMoney size="1rem" />}
            color="blue"
          >
            <Center>
              <Text fw={500} size={20}>
                ₱{" "}
                {addCommaToNumber(totalItemPrice + totalAdditionalChargePrice)}
              </Text>
            </Center>
          </Alert>
        </>
      ) : null}
    </Paper>
  );
};

export default QuotationSummary;
