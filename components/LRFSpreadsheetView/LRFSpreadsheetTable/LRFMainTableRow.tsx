import { formatDate, formatTime } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { LRFSpreadsheetData } from "@/utils/types";
import { Table } from "@mantine/core";

type Props = {
  item: LRFSpreadsheetData;
  index: number;
};

const LRFMainTableRow = ({ item, index }: Props) => {
  const renderNestedTable = ({
    requestResponseList,
    parentIndex,
  }: {
    requestResponseList: LRFSpreadsheetData["request_response_list"];
    parentIndex: number;
  }) => {
    const groupedRows = renderNestedRows(requestResponseList);

    return (
      <Table withColumnBorders>
        {parentIndex === 0 && (
          <thead>
            <tr>
              <th>Supplier Name/Payee</th>
              <th>Type of Request</th>
              <th>Invoice Amount</th>
              <th>VAT</th>
              <th>Cost</th>
              <th>Equipment/Cost Code</th>
              <th>BOQ Code</th>
            </tr>
          </thead>
        )}
        <tbody>{groupedRows}</tbody>
      </Table>
    );
  };

  const renderNestedRows = (
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
      "Equipment/Cost Code",
      "Bill of Quantity Code",
    ];

    return fields.map((field) => {
      let response: string | undefined;

      if (field === "Equipment/Cost Code") {
        response =
          responseList.find(
            (response) => response.field_name === "Equipment Code"
          )?.request_response ||
          responseList.find((response) => response.field_name === "Cost Code")
            ?.request_response;
      } else {
        response = responseList.find(
          (response) => response.field_name === field
        )?.request_response;
      }

      const value = safeParse(response ?? "");

      const isNumber = !isNaN(value) && value !== "";

      return <td key={field}>{isNumber ? Number(value).toFixed(2) : value}</td>;
    });
  };

  return (
    <tr>
      <td>{`${item.request_formsly_id_prefix}-${item.request_formsly_id_serial}`}</td>
      <td>{item.jira_project_jira_label}</td>
      <td>{item.request_department_code}</td>
      <td>{item.request_jira_id}</td>
      <td>
        {formatDate(new Date(item.request_date_created))}{" "}
        {formatTime(new Date(item.request_date_created))}
      </td>
      <td>
        {item.request_boq_data
          ? item.request_boq_data.request_formsly_id
          : "N/A"}
      </td>
      <td style={{ padding: 0 }}>
        {renderNestedTable({
          requestResponseList: item.request_response_list,
          parentIndex: index,
        })}
      </td>
    </tr>
  );
};

export default LRFMainTableRow;
