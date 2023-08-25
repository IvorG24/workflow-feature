import { useUserTeamMember } from "@/stores/useUserStore";
import { addCommaToNumber, regExp } from "@/utils/string";
import {
  DuplicateSectionType,
  ReceiverStatusType,
  RequestProjectSignerStatusType,
} from "@/utils/types";
import {
  Indicator,
  Paper,
  ScrollArea,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
} from "@tabler/icons-react";

type Props = {
  summaryData: DuplicateSectionType[];
  projectSignerStatus?: RequestProjectSignerStatusType;
};

const SourcedItemSummary = ({ summaryData, projectSignerStatus }: Props) => {
  const teamMember = useUserTeamMember();
  const { colors, colorScheme } = useMantineTheme();
  const userProjectList = projectSignerStatus?.filter(
    (project) => project.signer_team_member_id === teamMember?.team_member_id
  );

  const signerStatusIcon = (status: ReceiverStatusType) => {
    switch (status) {
      case "APPROVED":
        return (
          <Tooltip label="Approved">
            <ThemeIcon color="green" size="xs" radius="xl">
              <IconCircleCheck />
            </ThemeIcon>
          </Tooltip>
        );
      case "PENDING":
        return (
          <Tooltip label="Pending">
            <ThemeIcon color="blue" size="xs" radius="xl">
              <IconCircleDashed />
            </ThemeIcon>
          </Tooltip>
        );
      case "REJECTED":
        return (
          <Tooltip label="Rejected">
            <ThemeIcon color="red" size="xs" radius="xl">
              <IconCircleX />
            </ThemeIcon>
          </Tooltip>
        );
    }
  };

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
              <th>Quantity</th>
              <th>Unit</th>
              <th>Source Project</th>
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

              const parsedQuantity = JSON.parse(
                `${summary.section_field[1].field_response?.request_response}`
              );
              const matches = regExp.exec(item);
              const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();
              const sourceProject = JSON.parse(
                `${summary.section_field[2].field_response?.request_response}`
              );

              let isUserInProject = false;
              if (userProjectList) {
                isUserInProject =
                  userProjectList.filter(
                    (project) => project.signer_project_name === sourceProject
                  ).length > 0;
              }

              const projectStatus =
                projectSignerStatus?.find(
                  (signer) => signer?.signer_project_name === sourceProject
                )?.signer_status || "PENDING";

              let rowColor = "transparent";
              const isDarkTheme = colorScheme === "dark";

              if (isUserInProject)
                rowColor = isDarkTheme
                  ? `${colors.yellow[5]}88`
                  : colors.yellow[0];

              const parsedItem = JSON.parse(item);
              const closingIndex = parsedItem.indexOf(")");
              const newItem = parsedItem.slice(0, closingIndex + 1);
              const description = parsedItem
                .slice(closingIndex + 3, parsedItem.length - 1)
                .split(", ")
                .join("\n");

              return (
                <tr
                  key={index}
                  style={{
                    backgroundColor: rowColor,
                  }}
                >
                  <td>
                    <Indicator
                      position="middle-start"
                      label={signerStatusIcon(projectStatus)}
                      size={25}
                      color="transparent"
                      offset={10}
                    >
                      <Text pl={32} fw={700}>
                        {newItem}
                      </Text>
                      <pre style={{ marginTop: 10 }}>
                        <Text pl={32}>{description}</Text>
                      </pre>
                    </Indicator>
                  </td>
                  <td>{addCommaToNumber(parsedQuantity)}</td>
                  <td>{unit}</td>
                  <td>{sourceProject}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default SourcedItemSummary;
