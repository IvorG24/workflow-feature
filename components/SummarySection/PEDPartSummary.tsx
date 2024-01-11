import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const PEDPartSummary = ({ summaryData }: Props) => {
  return (
    <Paper
      p="xl"
      shadow="xs"
      className="onboarding-requisition-request-summary"
    >
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
              <th>General Item Name</th>
              <th>Component Category</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Part Number</th>
              <th>Quantity</th>
              <th>Unit of Measurement</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              return (
                <tr key={index}>
                  {summary.section_field.map((field) => {
                    const response = field.field_response
                      ?.request_response as string;
                    return (
                      <td key={field.field_id}>
                        {field.field_name === "Quantity"
                          ? addCommaToNumber(Number(response))
                          : JSON.parse(response)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default PEDPartSummary;
