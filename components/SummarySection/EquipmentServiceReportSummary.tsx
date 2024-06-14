import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const EquipmentServiceReportSummary = ({ summaryData }: Props) => {
  const jobContentSection: DuplicateSectionType[] = [];
  const resourceReferenceSection: DuplicateSectionType[] = [];
  const itemSection: DuplicateSectionType[] = [];

  summaryData.forEach((section) => {
    switch (section.section_name) {
      case "Job Content":
        jobContentSection.push(section);
        break;
      case "Resource Reference":
        resourceReferenceSection.push(section);
        break;
      case "Item":
        itemSection.push(section);
        break;
    }
  });

  return (
    <>
      <Paper p="xl" shadow="xs">
        <Title order={4} color="dimmed">
          Job Content Summary
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
                <th>Action Plan</th>
              </tr>
            </thead>
            <tbody>
              {jobContentSection.map((summary, index) => {
                const actionPlan = JSON.parse(
                  `${summary.section_field[0].field_response?.request_response}`
                );

                return (
                  <tr key={index}>
                    <td>{actionPlan}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ScrollArea>
      </Paper>
      <Paper p="xl" shadow="xs">
        <Title order={4} color="dimmed">
          Resource Reference Summary
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
                <th>Name</th>
                <th>Position</th>
                <th>Action Plan</th>
                <th>Duration</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {resourceReferenceSection.map((summary, index) => {
                const name = JSON.parse(
                  `${summary.section_field[0].field_response?.request_response}`
                );
                const position = JSON.parse(
                  `${summary.section_field[1].field_response?.request_response}`
                );
                const actionPlan = JSON.parse(
                  `${summary.section_field[2].field_response?.request_response}`
                ).join(", ");
                const duration = JSON.parse(
                  `${summary.section_field[3].field_response?.request_response}`
                );
                const unit = JSON.parse(
                  `${summary.section_field[4].field_response?.request_response}`
                );

                return (
                  <tr key={index}>
                    <td>{name}</td>
                    <td>{position}</td>
                    <td>{actionPlan}</td>
                    <td>{duration}</td>
                    <td>{unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ScrollArea>
      </Paper>
      <Paper p="xl" shadow="xs">
        <Title order={4} color="dimmed">
          Item Summary
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
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Unit of Measure</th>
              </tr>
            </thead>
            <tbody>
              {itemSection.map((summary, index) => {
                const generalName = JSON.parse(
                  `${summary.section_field[0].field_response?.request_response}`
                );

                let description = "";
                summary.section_field.slice(1, 5).forEach((field) => {
                  if (field.field_response) {
                    description += `${field.field_name}: ${JSON.parse(
                      field.field_response.request_response
                    )}\n`;
                  }
                });

                const quantity = JSON.parse(
                  `${summary.section_field[5].field_response?.request_response}`
                );
                const unit = JSON.parse(
                  `${summary.section_field[6].field_response?.request_response}`
                );

                return (
                  <tr key={index}>
                    <td>{generalName}</td>
                    <td>
                      <pre>
                        <Text>{description}</Text>
                      </pre>
                    </td>
                    <td>{addCommaToNumber(quantity)}</td>
                    <td>{unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </>
  );
};

export default EquipmentServiceReportSummary;
