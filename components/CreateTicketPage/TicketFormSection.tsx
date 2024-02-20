import { CreateTicketFormValues } from "@/utils/types";
import { ActionIcon, Divider, Flex, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { FieldArrayWithId } from "react-hook-form";
import TicketFormFields from "./TicketFormFields";

type Props = {
  category: string;
  ticketSection: FieldArrayWithId<
    CreateTicketFormValues,
    "ticket_sections",
    "id"
  >;
  ticketSectionIdx: number;
  onRemoveSection?: (sectionDuplicatableId: string) => void;
  isEdit?: boolean;
  requestItemCSIMethods?: {
    onCSICodeChange: (sectionIndex: number, value: string | null) => void;
  };
  requestItemOptionMethods?: {
    onItemNameChange: (sectionIndex: number, value: string | null) => void;
  };
};

const TicketFormSection = ({
  category,
  ticketSectionIdx,
  ticketSection,
  onRemoveSection,
  isEdit,
  requestItemCSIMethods,
  requestItemOptionMethods,
}: Props) => {
  const { field_section_duplicatable_id } = ticketSection;
  return (
    <Flex direction="column" gap="xs" mt="md">
      {ticketSectionIdx !== 0 && (
        <Flex align="center">
          <Divider
            label={`${ticketSection.ticket_section_name} #${ticketSectionIdx}`}
            sx={{ flex: 1 }}
          />
          {field_section_duplicatable_id && (
            <Tooltip
              label={`Remove ${ticketSection.ticket_section_name} #${ticketSectionIdx}`}
            >
              <ActionIcon
                onClick={() =>
                  onRemoveSection &&
                  onRemoveSection(field_section_duplicatable_id)
                }
                variant="light"
                color="red"
                ml="md"
                display={true ? "flex" : "none"}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      )}

      {ticketSection.ticket_section_fields.map(
        (ticketField, ticketFieldIdx) => {
          return (
            <TicketFormFields
              category={category}
              ticketField={ticketField}
              ticketFieldIdx={ticketFieldIdx}
              ticketSectionIdx={ticketSectionIdx}
              isEdit={isEdit}
              requestItemCSIMethods={requestItemCSIMethods}
              requestItemOptionMethods={requestItemOptionMethods}
              key={
                ticketField.ticket_field_id + ticketSection.ticket_section_id
              }
            />
          );
        }
      )}
    </Flex>
  );
};

export default TicketFormSection;
