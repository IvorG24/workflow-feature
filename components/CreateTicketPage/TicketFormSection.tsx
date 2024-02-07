import { CreateTicketFormValues } from "@/utils/types";
import { Divider, Flex } from "@mantine/core";
import { FieldArrayWithId } from "react-hook-form";
import TicketFormFields from "./TicketFormFields";

type Props = {
  ticketSection: FieldArrayWithId<
    CreateTicketFormValues,
    "ticket_sections",
    "id"
  >;
  ticketSectionIdx: number;
  onDuplicateSection?: () => void;
  requestCustomCSIMethodsFormMethods?: {
    onItemNameChange: (index: number, value: string | null) => void;
  };
};

const TicketFormSection = ({
  ticketSectionIdx,
  ticketSection,
  requestCustomCSIMethodsFormMethods,
}: Props) => {
  return (
    <Flex direction="column" gap="xs" mt="md">
      {ticketSectionIdx !== 0 && (
        <Divider
          label={`${ticketSection.ticket_section_name} #${ticketSectionIdx}`}
        />
      )}
      {ticketSection.ticket_section_fields.map(
        (ticketField, ticketFieldIdx) => {
          return (
            <TicketFormFields
              ticketField={ticketField}
              ticketFieldIdx={ticketFieldIdx}
              ticketSectionIdx={ticketSectionIdx}
              requestCustomCSIMethodsFormMethods={
                requestCustomCSIMethodsFormMethods
              }
              key={ticketField.ticket_field_id}
            />
          );
        }
      )}
    </Flex>
  );
};

export default TicketFormSection;
