import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import { CreateTicketFormValues, TicketSection } from "@/utils/types";
import { FileInput, Select, TextInput, Textarea } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  ticketField: TicketSection["ticket_section_fields"][0];
  ticketFieldIdx: number;
  ticketSectionIdx: number;
  requestCustomCSIMethodsFormMethods?: {
    onCSICodeDescriptionChange: (value: string) => void;
  };
};

const TicketFormFields = ({
  ticketField,
  ticketFieldIdx,
  ticketSectionIdx,
  requestCustomCSIMethodsFormMethods,
}: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateTicketFormValues>();

  const fieldError =
    errors.ticket_sections?.[ticketSectionIdx]?.ticket_section_fields?.[
      ticketFieldIdx
    ]?.ticket_field_response?.message;

  const inputProps = {
    label: ticketField.ticket_field_name,
    readOnly: ticketField.ticket_field_is_read_only,
    variant: ticketField.ticket_field_is_read_only ? "filled" : "default",
    error: fieldError,
  };

  const fieldRules = {
    required: {
      value: ticketField.ticket_field_is_required,
      message: `${ticketField.ticket_field_name.replace(
        /\?/g,
        ""
      )} is required`,
    },
  };

  const renderField = (field: TicketSection["ticket_section_fields"][0]) => {
    switch (field.ticket_field_type) {
      case "TEXT":
        return (
          <Controller
            control={control}
            name={`ticket_sections.${ticketSectionIdx}.ticket_section_fields.${ticketFieldIdx}.ticket_field_response`}
            render={({ field }) => (
              <TextInput
                {...inputProps}
                value={`${field.value}`}
                onChange={(event) => {
                  console.log(event.currentTarget.value);
                  if (ticketField.ticket_field_name === "Item Name") {
                    requestCustomCSIMethodsFormMethods?.onCSICodeDescriptionChange(
                      event.currentTarget.value
                    );
                  }
                  field.onChange(event.currentTarget.value);
                }}
                error={fieldError}
                withAsterisk={ticketField.ticket_field_is_required}
              />
            )}
            rules={{ ...fieldRules }}
          />
        );

      case "TEXTAREA":
        return (
          <Textarea
            {...inputProps}
            {...register(
              `ticket_sections.${ticketSectionIdx}.ticket_section_fields.${ticketFieldIdx}.ticket_field_response`,
              {
                ...fieldRules,
              }
            )}
            minRows={3}
            error={fieldError}
            withAsterisk={field.ticket_field_is_required}
          />
        );

      case "SELECT":
        const selectOptions = ticketField.ticket_field_option.map(
          (option) => option.ticket_option_value
        );
        return (
          <Controller
            control={control}
            name={`ticket_sections.${ticketSectionIdx}.ticket_section_fields.${ticketFieldIdx}.ticket_field_response`}
            render={({ field: { value, onChange } }) => (
              <Select
                value={value as string}
                onChange={(value) => {
                  onChange(value);
                }}
                data={selectOptions}
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

      case "FILE":
        return (
          <Controller
            control={control}
            name={`ticket_sections.${ticketSectionIdx}.ticket_section_fields.${ticketFieldIdx}.ticket_field_response`}
            render={({ field }) => (
              <FileInput
                {...inputProps}
                icon={<IconFile size={16} />}
                value={field.value as File | null}
                clearable
                multiple={false}
                onChange={field.onChange}
                error={fieldError}
              />
            )}
            rules={{
              ...fieldRules,
              validate: {
                fileSize: (value) => {
                  if (!value) return true;
                  const formattedValue = value as File;
                  return formattedValue.size !== undefined
                    ? formattedValue.size <= MAX_FILE_SIZE ||
                        `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`
                    : true;
                },
              },
            }}
          />
        );
    }
  };

  return <>{renderField(ticketField)}</>;
};

export default TicketFormFields;
