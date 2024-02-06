import { TicketFieldWithResponse } from "@/utils/types";
import { Flex } from "@mantine/core";
import { FieldArrayWithId } from "react-hook-form";
import TicketFormFields from "./TicketFormFields";

export type CreateTicketFormValues = {
  fields: TicketFieldWithResponse[] | null;
};
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
    <Flex direction="column" gap="xs" mt="md">
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
