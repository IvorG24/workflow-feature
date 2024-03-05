import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_MB,
  createTicketFilePlaceholder,
} from "@/utils/constant";
import { formatCSICode } from "@/utils/string";
import { CreateTicketFormValues, TicketSection } from "@/utils/types";
import { FileInput, Select, Text, TextInput, Textarea } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  category: string;
  ticketField: TicketSection["ticket_section_fields"][0];
  ticketFieldIdx: number;
  ticketSectionIdx: number;
  isEdit?: boolean;
  requestItemCSIMethods?: {
    onCSICodeChange: (sectionIndex: number, value: string | null) => void;
  };
  requestItemOptionMethods?: {
    onItemNameChange: (sectionIndex: number, value: string | null) => void;
    onItemDescriptionChange: (
      sectionIndex: number,
      value: string | null
    ) => void;
  };
};

const TicketFormFields = ({
  category,
  ticketField,
  ticketFieldIdx,
  ticketSectionIdx,
  isEdit,
  requestItemCSIMethods,
  requestItemOptionMethods,
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
            render={({ field: { value, onChange } }) => (
              <TextInput
                {...inputProps}
                value={`${value}`}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  if (
                    category === "Request Custom CSI" &&
                    ticketField.ticket_field_name === "CSI Code"
                  ) {
                    value = formatCSICode(value);
                  }
                  onChange(value);
                }}
                error={fieldError}
                withAsterisk={field.ticket_field_is_required}
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
        return (
          <Controller
            control={control}
            name={`ticket_sections.${ticketSectionIdx}.ticket_section_fields.${ticketFieldIdx}.ticket_field_response`}
            render={({ field: { value, onChange } }) => (
              <Select
                value={value as string}
                onChange={(value) => {
                  onChange(value);
                  if (ticketField.ticket_field_name === "CSI Code Description")
                    requestItemCSIMethods?.onCSICodeChange(
                      ticketSectionIdx,
                      value
                    );
                  else if (ticketField.ticket_field_name === "Item Name")
                    requestItemOptionMethods?.onItemNameChange(
                      ticketSectionIdx,
                      value
                    );
                  else if (ticketField.ticket_field_name === "Item Description")
                    requestItemOptionMethods?.onItemDescriptionChange(
                      ticketSectionIdx,
                      value
                    );
                }}
                data={ticketField.ticket_field_option}
                limit={250}
                nothingFound={<Text>Nothing found!</Text>}
                withAsterisk={field.ticket_field_is_required}
                {...inputProps}
                sx={{
                  display: Boolean(ticketField.ticket_field_hidden)
                    ? "none"
                    : "inline",
                }}
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
                value={
                  isEdit && typeof field.value === "string"
                    ? createTicketFilePlaceholder(`${field.value}`)
                    : (field.value as File | null)
                }
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