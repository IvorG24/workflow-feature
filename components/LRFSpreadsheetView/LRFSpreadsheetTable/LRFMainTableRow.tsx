import { formatDate, formatTime } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { LRFSpreadsheetData } from "@/utils/types";
import { createStyles, Table } from "@mantine/core";

type Props = {
  item: LRFSpreadsheetData;
  index: number;
};

const useStyles = createStyles((theme) => ({
  originalRow: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.gray[8]
        : theme.colors.gray[2],
    "& tr": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.gray[8]
          : theme.colors.gray[2],
    },
  },
  alternateRow: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.gray[7]
        : theme.colors.gray[0],
    "& tr": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.gray[7]
          : theme.colors.gray[0],
    },
  },
}));

// Define fields to filter
const relevantFields = [
  "Type of Request",
  "Invoice Amount",
  "VAT",
  "Cost",
  "Equipment/Cost Code",
  "Bill of Quantity Code",
];

const LRFMainTableRow = ({ item, index }: Props) => {
  const { classes } = useStyles();

  const renderNestedTable = ({
    requestResponseList,
    parentIndex,
  }: {
    requestResponseList: LRFSpreadsheetData["request_response_list"];
    parentIndex: number;
  }) => {
    const groupedRows = renderNestedRows(requestResponseList);
    return (
      <Table
        withColumnBorders
        className={index % 2 === 0 ? classes.alternateRow : classes.originalRow}
      >
        {parentIndex === 0 && (
          <thead>
            <tr>
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

  const getValueTotalOfNumericField = (
    fieldWithResponseList: LRFSpreadsheetData["request_response_list"],
    fieldName: string
  ) => {
    const totalValue = fieldWithResponseList
      .filter((response) => response.field_name === fieldName)
      .reduce((total, response) => {
        return (total += Number(response.request_response));
      }, 0);

    return totalValue;
  };

  const renderNestedRows = (
    responseList: LRFSpreadsheetData["request_response_list"]
  ) => {
    const filteredRequestResponseList = responseList.filter((response) =>
      relevantFields.includes(response.field_name)
    );

    const groupedData = filteredRequestResponseList.reduce((acc, current) => {
      const key =
        current.request_response_request_id +
        (current.request_response_duplicatable_section_id || "");
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: LRFSpreadsheetData["request_response_list"] });

    const groupedResponses = Object.values(groupedData).map(
      (responses) => responses
    );

    const reducedGroupedResponses = groupedResponses.reduce((acc, response) => {
      const boqCode = safeParse(
        response.find(
          (response) => response.field_name === "Bill of Quantity Code"
        )?.request_response || ""
      );

      const key =
        response[0].request_response_request_id +
        "-" +
        safeParse(
          response.find((response) => response.field_name === "Type of Request")
            ?.request_response || ""
        ) +
        "-boq-" +
        boqCode;

      if (!acc[key]) {
        acc[key] = response;
      } else {
        // check if same boq code with existing duplicate type of request
        const existingDuplicateTypeOfRequest = safeParse(
          acc[key].find(
            (response) => response.field_name === "Bill of Quantity Code"
          )?.request_response || ""
        );

        if (existingDuplicateTypeOfRequest === boqCode) {
          // update invoice amount, vat, and cost
          const invoiceAmountFieldIndex = acc[key].findIndex(
            (field) => field.field_name === "Invoice Amount"
          );
          const vatFieldIndex = acc[key].findIndex(
            (field) => field.field_name === "VAT"
          );
          const costFieldIndex = acc[key].findIndex(
            (field) => field.field_name === "Cost"
          );

          const invoiceAmountFieldNewValue =
            Number(acc[key][invoiceAmountFieldIndex].request_response) +
            Number(
              response.find((field) => field.field_name === "Invoice Amount")
                ?.request_response
            );

          const costFieldNewValue =
            Number(acc[key][costFieldIndex].request_response) +
            Number(
              response.find((field) => field.field_name === "Cost")
                ?.request_response
            );

          acc[key] = acc[key].map((response) => {
            if (response.field_name === "Invoice Amount") {
              response.request_response = `${invoiceAmountFieldNewValue}`;
            } else if (response.field_name === "Cost") {
              response.request_response = `${costFieldNewValue}`;
            }

            return response;
          });

          if (vatFieldIndex > 0) {
            const vatFieldNewValue =
              Number(acc[key][vatFieldIndex].request_response) +
              Number(
                response.find((field) => field.field_name === "VAT")
                  ?.request_response || 0
              );
            acc[key][vatFieldIndex] = {
              ...acc[key][vatFieldIndex],
              request_response: `${vatFieldNewValue}`,
            };
          } else if (
            vatFieldIndex < 0 &&
            !isNaN(
              Number(
                response.find((field) => field.field_name === "VAT")
                  ?.request_response
              )
            )
          ) {
            const vatField = response.find(
              (field) => field.field_name === "VAT"
            );
            if (vatField) {
              acc[key].push(vatField);
            }
          }
        }
      }
      return acc;
    }, {} as { [key: string]: LRFSpreadsheetData["request_response_list"] });
    // console.log(reducedGroupedResponses);
    const defaultRows = Object.values(reducedGroupedResponses).map(
      (responses, index) => {
        return <tr key={index}>{renderCells(responses)}</tr>;
      }
    );

    const totalRow: LRFSpreadsheetData["request_response_list"] = [];
    const totalAmount = getValueTotalOfNumericField(
      filteredRequestResponseList,
      "Invoice Amount"
    );
    const totalCost = getValueTotalOfNumericField(
      filteredRequestResponseList,
      "Cost"
    );
    const totalVat = getValueTotalOfNumericField(
      filteredRequestResponseList,
      "VAT"
    );

    const typeOfRequest = filteredRequestResponseList.find(
      (response) => response.field_name === "Type of Request"
    );
    const invoiceAmount = filteredRequestResponseList.find(
      (response) => response.field_name === "Invoice Amount"
    );
    const vat = filteredRequestResponseList.find(
      (response) => response.field_name === "VAT"
    );
    const cost = filteredRequestResponseList.find(
      (response) => response.field_name === "Cost"
    );

    if (typeOfRequest) {
      totalRow.push({
        ...typeOfRequest,
        request_response: '"Total"',
      });
    }

    if (invoiceAmount) {
      totalRow.push({
        ...invoiceAmount,
        request_response: `${totalAmount}`,
      });
    }
    if (vat) {
      totalRow.push({
        ...vat,
        request_response: `${totalVat}`,
      });
    }
    if (cost) {
      totalRow.push({
        ...cost,
        request_response: `${totalCost}`,
      });
    }

    const payeeTotalRow = (
      <tr key={`${index}-total`} style={{ fontWeight: "600" }}>
        {renderCells(totalRow)}
      </tr>
    );

    return [...defaultRows, payeeTotalRow];
  };

  const renderCells = (
    responseList: LRFSpreadsheetData["request_response_list"]
  ) => {
    const defaultFields = relevantFields.map((field) => {
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

    return defaultFields;
  };

  return (
    <tr
      className={index % 2 === 0 ? classes.alternateRow : classes.originalRow}
    >
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
