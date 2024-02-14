import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const PEDEquipmentSummary = ({ summaryData }: Props) => {
  return (
    <Paper p="xl" shadow="xs" className="onboarding-item-request-summary">
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
              <th>Category</th>
              <th>Equipment Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Capacity</th>
              <th>Capacity UoM</th>
              <th>Date Needed</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((summary, index) => {
              return (
                <tr key={index}>
                  {summary.section_field.map((field) => {
                    const response = safeParse(
                      field.field_response?.request_response as string
                    );

                    if (field.field_type === "DATE")
                      return (
                        <td key={field.field_id}>{formatDate(response)}</td>
                      );
                    return <td key={field.field_id}>{response}</td>;
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

export default PEDEquipmentSummary;
