import { TicketFieldWithResponse } from "@/utils/types";
import { Select, TextInput, Textarea } from "@mantine/core";
import { Controller, FieldArrayWithId, useFormContext } from "react-hook-form";
import { CreateTicketFormValues } from "./TicketFieldList";

type Props = {
  ticketField: FieldArrayWithId<CreateTicketFormValues, "fields", "id">;
  ticketFieldIdx: number;
  requestCustomCSIMethodsFormMethods?: {
    onItemNameChange: (index: number, value: string | null) => void;
  };
};

const TicketFormFields = ({
  ticketField,
  ticketFieldIdx,
  requestCustomCSIMethodsFormMethods,
}: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateTicketFormValues>();

  const fieldError = errors.fields?.[ticketFieldIdx]?.response?.message;

  const inputProps = {
    label: ticketField.ticket_field_name,
    description: ticketField.ticket_field_description,
    required: ticketField.ticket_field_is_required,
    readOnly: ticketField.ticket_field_is_read_only,
    variant: ticketField.ticket_field_is_read_only ? "filled" : "default",
    error: fieldError,
  };

  const fieldRules = {
    required: {
      value: ticketField.ticket_field_is_required,
      message: "This field is required",
    },
  };

  const renderField = (field: TicketFieldWithResponse) => {
    switch (field.ticket_field_type) {
      case "TEXT":
        return (
          <TextInput
            {...inputProps}
            {...register(`fields.${ticketFieldIdx}.response`, {
              ...fieldRules,
            })}
            error={fieldError}
            withAsterisk={field.ticket_field_is_required}
          />
        );

      case "TEXTAREA":
        return (
          <Textarea
            {...inputProps}
            {...register(`fields.${ticketFieldIdx}.response`, {
              ...fieldRules,
            })}
            error={fieldError}
            withAsterisk={field.ticket_field_is_required}
          />
        );

      case "DROPDOWN":
        return (
          <Controller
            control={control}
            name={`fields.${ticketFieldIdx}.response`}
            render={({ field: { value, onChange } }) => (
              <Select
                value={value as string}
                onChange={(value) => {
                  onChange(value);

                  if (field.ticket_field_name === "Item Name") {
                    requestCustomCSIMethodsFormMethods?.onItemNameChange(
                      ticketFieldIdx,
                      value
                    );
                  }
                }}
                data={[]}
                withAsterisk={field.ticket_field_is_required}
                {...inputProps}
                clearable
                error={fieldError}
                searchable
              />
            )}
            rules={{ ...fieldRules }}
          />
        );
    }
  };

  return <>{renderField(ticketField)}</>;
};

export default TicketFormFields;
