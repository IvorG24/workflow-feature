import { addCommaToNumber } from "@/utils/string";
import { DuplicateSectionType } from "@/utils/types";
import { Paper, ScrollArea, Table, Text, Title } from "@mantine/core";

type Props = {
  summaryData: DuplicateSectionType[];
};

const PersonnelTransferRequisitionSummary = ({ summaryData }: Props) => {
  const replacementOrRelieverSection: DuplicateSectionType[] = [];
  const employeeSection: DuplicateSectionType[] = [];
  const equipmentSection: DuplicateSectionType[] = [];
  const employeeWithEquipmentSection: DuplicateSectionType[] = [];
  const assetInformationSection: DuplicateSectionType[] = [];

  summaryData.forEach((section) => {
    switch (section.section_name) {
      case "Replacement / Reliever":
        replacementOrRelieverSection.push(section);
        break;
      case "Employee":
        employeeSection.push(section);
        break;
      case "Equipment":
        equipmentSection.push(section);
        break;
      case "Employee with Equipment":
        employeeWithEquipmentSection.push(section);
        break;
      case "Asset Information":
        assetInformationSection.push(section);
        break;
    }
  });

  return (
    <>
      {replacementOrRelieverSection.length ? (
        <Paper p="xl" shadow="xs">
          <Title order={4} color="dimmed">
            Replacement / Reliever Summary
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
                  <th>Employee No. (HRIS)</th>
                  <th>Employee Name</th>
                </tr>
              </thead>
              <tbody>
                {replacementOrRelieverSection.map((summary, index) => {
                  const employeeNumber = JSON.parse(
                    `${summary.section_field[0].field_response?.request_response}`
                  );
                  const employeeName = JSON.parse(
                    `${summary.section_field[1].field_response?.request_response}`
                  );

                  return (
                    <tr key={index}>
                      <td>{employeeNumber}</td>
                      <td>{employeeName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ) : null}
      {employeeSection.length ? (
        <Paper p="xl" shadow="xs">
          <Title order={4} color="dimmed">
            Employee Summary
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
                  <th>Employee No. (HRIS)</th>
                  <th>Employee Name</th>
                  <th>Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {employeeSection.map((summary, index) => {
                  const employeeNumber = JSON.parse(
                    `${summary.section_field[0].field_response?.request_response}`
                  );
                  const employeeName = JSON.parse(
                    `${summary.section_field[1].field_response?.request_response}`
                  );
                  const contactNumber = JSON.parse(
                    `${summary.section_field[2].field_response?.request_response}`
                  );

                  return (
                    <tr key={index}>
                      <td>{employeeNumber}</td>
                      <td>{employeeName}</td>
                      <td>{contactNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ) : null}
      {equipmentSection.length ? (
        <Paper p="xl" shadow="xs">
          <Title order={4} color="dimmed">
            Equipment Summary
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
                  <th>Equipment Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {equipmentSection.map((summary, index) => {
                  let description = "";
                  summary.section_field.slice(0, 4).forEach((field) => {
                    if (field.field_response) {
                      description += `${field.field_name}: ${JSON.parse(
                        field.field_response.request_response
                      )}\n`;
                    }
                  });

                  const quantity = JSON.parse(
                    `${summary.section_field[4].field_response?.request_response}`
                  );
                  const unit = JSON.parse(
                    `${summary.section_field[5].field_response?.request_response}`
                  );

                  return (
                    <tr key={index}>
                      <td>
                        <pre>
                          <Text>{description.slice(0, -1)}</Text>
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
      ) : null}
      {employeeWithEquipmentSection.length ? (
        <Paper p="xl" shadow="xs">
          <Title order={4} color="dimmed">
            Employee with Equipment Summary
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
                  <th>Employee No. (HRIS)</th>
                  <th>Employee Name</th>
                  <th>Contact Number</th>
                  <th>Equipment Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {employeeWithEquipmentSection.map((summary, index) => {
                  const employeeNumber = JSON.parse(
                    `${summary.section_field[0].field_response?.request_response}`
                  );
                  const employeeName = JSON.parse(
                    `${summary.section_field[1].field_response?.request_response}`
                  );
                  const contactNumber = JSON.parse(
                    `${summary.section_field[2].field_response?.request_response}`
                  );

                  let description = "";
                  summary.section_field.slice(3, 7).forEach((field) => {
                    if (field.field_response) {
                      description += `${field.field_name}: ${JSON.parse(
                        field.field_response.request_response
                      )}\n`;
                    }
                  });

                  const quantity = JSON.parse(
                    `${summary.section_field[7].field_response?.request_response}`
                  );
                  const unit = JSON.parse(
                    `${summary.section_field[8].field_response?.request_response}`
                  );

                  return (
                    <tr key={index}>
                      <td>{employeeNumber}</td>
                      <td>{employeeName}</td>
                      <td>{contactNumber}</td>
                      <td>
                        <pre>
                          <Text>{description.slice(0, -1)}</Text>
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
      ) : null}
      {assetInformationSection.length ? (
        <Paper p="xl" shadow="xs">
          <Title order={4} color="dimmed">
            Replacement / Reliever Summary
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
                  <th>Asset Number</th>
                  <th>Asset Description</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {assetInformationSection.map((summary, index) => {
                  const assetNumber = JSON.parse(
                    `${summary.section_field[0].field_response?.request_response}`
                  );
                  const assetDescription = JSON.parse(
                    `${summary.section_field[1].field_response?.request_response}`
                  );
                  const quantity = JSON.parse(
                    `${summary.section_field[1].field_response?.request_response}`
                  );

                  return (
                    <tr key={index}>
                      <td>{assetNumber}</td>
                      <td>{assetDescription}</td>
                      <td>{addCommaToNumber(quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ) : null}
    </>
  );
};

export default PersonnelTransferRequisitionSummary;
