import RequestSignerList from "@/components/RequestListPage/RequestSignerList";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey, pesoFormatter } from "@/utils/string";
import {
  getStatusToColor,
  mobileNumberFormatter,
  pagIbigNumberFormatter,
  sssIdNumberFormatter,
  tinNumberFormatter,
} from "@/utils/styling";
import {
  ApplicationInformationFieldObjectType,
  ApplicationInformationFieldType,
  ApplicationInformationSpreadsheetData,
  FieldTableRow,
  SectionTableRow,
} from "@/utils/types";
import { ActionIcon, Anchor, Badge, Center, Flex, Text } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";

export const duplicatableFieldIdList = [
  "98378ca4-3323-4f7c-a469-e33adec84d25",
  "00d3e4e7-9177-4497-948d-daba978f0aa3",
  "c35cf796-9613-4a02-8438-d2baa46e653b",
  "e0959707-0606-4610-af60-8fd49d014320",
];

type Props = {
  item: ApplicationInformationSpreadsheetData;
  fieldObject: ApplicationInformationFieldObjectType;
};

const ApplicationInformationMainTableRow = ({ item, fieldObject }: Props) => {
  const activeTeam = useActiveTeam();

  const [sortedFields, setSortedFields] = useState<
    ApplicationInformationFieldType[]
  >([]);

  useEffect(() => {
    const emptyFieldObject = { ...fieldObject } as Record<
      string,
      ApplicationInformationFieldType
    >;

    item.request_response_list.forEach((response) => {
      emptyFieldObject[response.field_id] = {
        ...emptyFieldObject[response.field_id],
        field_response: response.request_response,
      };
    });

    const sortedFields = Object.values(emptyFieldObject).sort((a, b) => {
      return a.field_order - b.field_order;
    });
    setSortedFields(
      sortedFields.filter(
        (field) => !duplicatableFieldIdList.includes(field.field_id)
      )
    );
  }, [item, fieldObject]);

  const renderFieldColumn = (
    row: FieldTableRow & {
      field_section: SectionTableRow;
    } & { field_response: string }
  ) => {
    const response = safeParse(row.field_response);

    if (!response && !(row.field_type === "SWITCH")) return "";
    switch (row.field_type) {
      case "DATE":
        switch (row.field_name) {
          case "Year Graduated":
            return `${moment(response).year()}`;
          default:
            return `${formatDate(response)}`;
        }
      case "FILE":
        return (
          <ActionIcon
            w="100%"
            variant="outline"
            color="blue"
            onClick={() => window.open(response, "_blank")}
          >
            <Flex align="center" justify="center" gap={2}>
              <Text size={14}>File</Text> <IconFile size={14} />
            </Flex>
          </ActionIcon>
        );
      case "SWITCH":
        return `${Boolean(response)}`;
      case "NUMBER":
        switch (row.field_name) {
          case "Contact Number":
            return mobileNumberFormatter(`${response}`);
          case "SSS ID Number":
          case "Philhealth Number":
            return sssIdNumberFormatter(`${response}`);
          case "Pag-IBIG Number":
            return pagIbigNumberFormatter(`${response}`);
          case "TIN":
            return tinNumberFormatter(`${response}`);
          case "Expected Salary (PHP)":
            return pesoFormatter(`${response}`);
          default:
            return response;
        }
      case "MULTISELECT":
        return response && response.join(", ");
      default:
        return response;
    }
  };

  return (
    <tr>
      <td>
        <Anchor
          href={`/${formatTeamNameToUrlKey(
            activeTeam.team_name ?? ""
          )}/requests/${item.request_formsly_id}`}
          target="_blank"
        >
          {item.request_formsly_id}
        </Anchor>
      </td>
      <td>{formatDate(new Date(item.request_date_created))}</td>
      <td>
        <Center>
          <Badge variant="filled" color={getStatusToColor(item.request_status)}>
            {item.request_status}
          </Badge>
        </Center>
      </td>
      <td>{item.request_status_date_updated}</td>
      <td>
        <RequestSignerList signerList={item.request_signer_list} />
      </td>
      {sortedFields
        .filter(
          (row) =>
            row.field_section.section_name !== "Most Recent Work Experience"
        )
        .map((row, index) => (
          <td key={index}>{renderFieldColumn(row)}</td>
        ))}
    </tr>
  );
};

export default ApplicationInformationMainTableRow;
