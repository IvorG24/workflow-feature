import { safeParse } from "@/utils/functions";
import { LRFSpreadsheetData } from "@/utils/types";
import { Box, ScrollArea, Table } from "@mantine/core";

type Props = {
  data: LRFSpreadsheetData[];
};

const LRFSpreadsheetView = ({ data }: Props) => {
  return (
    <ScrollArea type="auto" scrollbarSize={10}>
      <Box>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Request Formsly ID</th>
              <th>Jira ID</th>
              <th>Payee</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <MainTableRow key={item.request_id} item={item} index={index} />
            ))}
          </tbody>
        </Table>
      </Box>
    </ScrollArea>
  );
};

const MainTableRow = ({
  item,
  index,
}: {
  item: LRFSpreadsheetData;
  index: number;
}) => (
  <tr>
    <td
      style={{ minWidth: 120 }}
    >{`${item.request_formsly_id_prefix}-${item.request_formsly_id_serial}`}</td>
    <td style={{ minWidth: 120 }}>{item.request_jira_id}</td>
    <td>
      <NestedTable
        requestResponseList={item.request_response_list}
        parentIndex={index}
      />
    </td>
  </tr>
);

const NestedTable = ({
  requestResponseList,
  parentIndex,
}: {
  requestResponseList: LRFSpreadsheetData["request_response_list"];
  parentIndex: number;
}) => {
  const groupedRows = groupResponses(requestResponseList);

  return (
    <Table>
      {parentIndex === 0 && (
        <thead>
          <tr>
            <th>Supplier/Payee</th>
            <th>Type of Request</th>
            <th>Invoice Amount</th>
            <th>VAT</th>
            <th>Cost</th>
            <th>Equipment Code</th>
            <th>Cost Code</th>
            <th>BOQ Code</th>
          </tr>
        </thead>
      )}
      <tbody>{groupedRows}</tbody>
    </Table>
  );
};

const groupResponses = (
  responseList: LRFSpreadsheetData["request_response_list"]
) => {
  const groupedData = responseList.reduce((acc, current) => {
    const key =
      current.request_response_request_id +
      (current.request_response_duplicatable_section_id || "");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(current);
    return acc;
  }, {} as { [key: string]: LRFSpreadsheetData["request_response_list"] });

  return Object.values(groupedData).map((responses, index) => (
    <tr key={index}>{renderCells(responses)}</tr>
  ));
};

const renderCells = (
  responseList: LRFSpreadsheetData["request_response_list"]
) => {
  const fields = [
    "Supplier Name/Payee",
    "Type of Request",
    "Invoice Amount",
    "VAT",
    "Cost",
    "Equipment Code",
    "Cost Code",
    "Bill of Quantity Code",
  ];

  return fields.map((field) => {
    const response = responseList.find(
      (response) => response.field_name === field
    )?.request_response;

    const value = safeParse(response ?? "");

    const isNumber = !isNaN(value) && value !== "";

    return (
      <td style={{ minWidth: 120 }} key={field}>
        {isNumber ? Number(value).toFixed(2) : value}
      </td>
    );
  });
};

export default LRFSpreadsheetView;
