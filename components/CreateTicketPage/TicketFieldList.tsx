import { Flex } from "@mantine/core";
import { FieldArrayWithId } from "react-hook-form";
import { CreateTicketFormValues } from "./CreateTicketPage";
import TicketFormFields from "./TicketFormFields";

type Props = {
  ticketFields: FieldArrayWithId<CreateTicketFormValues, "fields", "id">[];
  requestCustomCSIMethodsFormMethods?: {
    onItemNameChange: (index: number, value: string | null) => void;
  };
};

const TicketFieldList = ({
  ticketFields,
  requestCustomCSIMethodsFormMethods,
}: Props) => {
  return (
    <Flex direction="column">
      {ticketFields.map((ticketField, ticketFieldIdx) => (
        <TicketFormFields
          ticketField={ticketField}
          ticketFieldIdx={ticketFieldIdx}
          requestCustomCSIMethodsFormMethods={
            requestCustomCSIMethodsFormMethods
          }
          key={ticketField.ticket_field_id}
        />
      ))}
    </Flex>
  );
};

export default TicketFieldList;
