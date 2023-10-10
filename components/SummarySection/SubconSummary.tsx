import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const SubconSummary = ({ summaryData }: Props) => {
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
              <th>Service</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              const service = JSON.parse(
                `${summary.section_field[0].field_response?.request_response}`
              );

              let description = "";
              summary.section_field.forEach((field) => {
                if (
                  field.field_response &&
                  field.field_name !== "Service Name"
                ) {
                  const fieldResponse = JSON.parse(
                    field.field_response.request_response
                  );

                  description += `${field.field_name}: ${
                    Array.isArray(fieldResponse)
                      ? `${
                          fieldResponse.length > 1 ? "\n\t" : ""
                        }${fieldResponse.join(", \n\t")}`
                      : `${fieldResponse}`
                  }\n`;
                }
              });

              return (
                <tr key={index}>
                  <td>{service}</td>
                  <td>
                    <pre>
                      <Text>{description.slice(0, -1)}</Text>
                    </pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default SubconSummary;
