import { getItem } from "@/backend/api/get";
import { createTicket, editTicket } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { CreateTicketFormValues } from "@/utils/types";
import { Button, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import TicketFormSection from "../CreateTicketPage/TicketFormSection";

type Props = {
  category: string;
  memberId: string;
  ticketForm: CreateTicketFormValues | null;
  isEdit?: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onOverrideTicket?: () => void;
  onClose?: () => void;
  onOverrideResponseComment?: (
    formValues: CreateTicketFormValues
  ) => Promise<void>;
};

const TicketRequestItemOptionForm = ({
  category,
  memberId,
  ticketForm,
  isEdit,
  setIsLoading,
  onOverrideTicket,
  onClose,
  onOverrideResponseComment,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const { ticketId } = router.query;
  const user = useUserProfile();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, getValues, control, setError } =
    createTicketFormMethods;

  const {
    fields: ticketSections,
    replace: replaceSection,
    remove: removeSection,
    insert: insertSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "ticket_sections",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);
      // option check if exists
      const optionExists = await itemDescriptionOptionsCheck(data);
      if (optionExists) return;

      const ticket = await createTicket(supabaseClient, {
        category,
        teamMemberId: memberId,
        ticketFormValues: data,
      });

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
          ticket.ticket_id
        }`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);
      // option check if exists
      const optionExists = await itemDescriptionOptionsCheck(data);
      if (optionExists) return;

      if (!category && !ticketId && user) return;
      const edited = await editTicket(supabaseClient, {
        ticketId: `${ticketId}`,
        ticketFormValues: data,
      });
      if (!edited) return;

      if (onOverrideResponseComment) await onOverrideResponseComment(data);
      if (onOverrideTicket) onOverrideTicket();
      if (onClose) onClose();

      notifications.show({
        message: "Ticket overriden.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemDescriptionOptionsCheck = async (data: CreateTicketFormValues) => {
    const itemName = `${data.ticket_sections[0].ticket_section_fields[0].ticket_field_response}`;
    const itemDescription = `${data.ticket_sections[0].ticket_section_fields[1].ticket_field_response}`;

    const item = await getItem(supabaseClient, {
      itemName,
      teamId: activeTeam.team_id,
    });

    const valueDataList = item.item_description
      .find(
        (description) => description.item_description_label === itemDescription
      )
      ?.item_description_field.map((field) =>
        field.item_description_field_value.toLowerCase()
      );
    let optionExists = false;
    data.ticket_sections.slice(1).map((section, sectionIdx) => {
      const value = `${section.ticket_section_fields[0].ticket_field_response}`;
      const valueExists = valueDataList?.includes(value.toLowerCase());
      if (valueExists) {
        setError(
          `ticket_sections.${
            sectionIdx + 1
          }.ticket_section_fields.${0}.ticket_field_response`,
          { message: `${value} already exists` }
        );
        optionExists = true;
      }
    });
    return optionExists;
  };

  const handleItemNameChange = async (index: number, value: string | null) => {
    const newSection = getValues(`ticket_sections.${index}`);

    if (value) {
      const item = await getItem(supabaseClient, {
        teamId: activeTeam.team_id,
        itemName: value,
      });

      const itemDescriptionOption = item.item_description.map(
        (description) => description.item_description_label
      );

      updateSection(index, {
        ...newSection,
        ticket_section_fields: [
          newSection.ticket_section_fields[0],
          {
            ...newSection.ticket_section_fields[1],
            ticket_field_response: "",
            ticket_field_option: itemDescriptionOption,
          },
          ...newSection.ticket_section_fields.slice(2),
        ],
      });
    } else {
      updateSection(index, {
        ...newSection,
        ticket_section_fields: [
          newSection.ticket_section_fields[0],
          {
            ...newSection.ticket_section_fields[1],
            ticket_field_response: "",
            ticket_field_option: [],
          },
          ...newSection.ticket_section_fields.slice(2),
        ],
      });
    }
  };

  const handleItemDescriptionChange = async (
    index: number,
    value: string | null
  ) => {
    const firstSection = getValues(`ticket_sections.${index}`);
    const itemName = `${firstSection.ticket_section_fields[0].ticket_field_response}`;
    const itemDescription = `${firstSection.ticket_section_fields[1].ticket_field_response}`;
    const allOptionSection = getValues(`ticket_sections`).slice(1);
    if (value && itemName) {
      const item = await getItem(supabaseClient, {
        teamId: activeTeam.team_id,
        itemName: `${itemName}`,
      });

      const itemDescriptionFieldUoM =
        (item.item_description.find(
          (description) =>
            description.item_description_label === itemDescription
        )?.item_description_field[0].item_description_field_uom[0]
          ?.item_description_field_uom as string) || "";

      if (itemDescriptionFieldUoM) {
        allOptionSection.forEach((section, sectionIdx) => {
          updateSection(sectionIdx + 1, {
            ...section,
            ticket_section_fields: [
              section.ticket_section_fields[0],
              {
                ...section.ticket_section_fields[1],
                ticket_field_response: itemDescriptionFieldUoM,
              },
            ],
          });
        });
      } else {
        allOptionSection.forEach((section, sectionIdx) => {
          updateSection(sectionIdx + 1, {
            ...section,
            ticket_section_fields: [
              section.ticket_section_fields[0],
              {
                ...section.ticket_section_fields[1],
                ticket_field_response: "",
              },
            ],
          });
        });
      }
    } else {
      allOptionSection.forEach((section, sectionIdx) => {
        updateSection(sectionIdx + 1, {
          ...section,
          ticket_section_fields: [
            section.ticket_section_fields[0],
            {
              ...section.ticket_section_fields[1],
              ticket_field_response: "",
            },
          ],
        });
      });
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = ticketSections
      .map((sectionItem) => sectionItem.ticket_section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = ticketSections.find(
      (section) => section.ticket_section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId =
        sectionMatch.ticket_section_fields.map((field, fieldIdx) => ({
          ...field,
          ticket_field_response:
            fieldIdx === 1 ? field.ticket_field_response : "",
          ticket_field_section_id: sectionDuplicatableId,
        }));
      const newSection = {
        ...sectionMatch,
        field_section_duplicatable_id: sectionDuplicatableId,
        ticket_section_fields: duplicatedFieldsWithDuplicatableId,
      };
      insertSection(sectionLastIndex + 1, newSection);
      return;
    }
  };

  const handleRemoveSection = (sectionDuplicatableId: string) => {
    const sectionMatchIndex = ticketSections.findIndex(
      (section) =>
        section.field_section_duplicatable_id === sectionDuplicatableId
    );
    if (sectionMatchIndex) {
      removeSection(sectionMatchIndex);
      return;
    }
  };

  useEffect(() => {
    if (ticketForm) {
      replaceSection(ticketForm.ticket_sections);
    }
  }, []);

  return (
    <>
      <FormProvider {...createTicketFormMethods}>
        <form
          onSubmit={handleSubmit(
            isEdit ? handleEditTicket : handleCreateTicket
          )}
        >
          {ticketSections.map((ticketSection, ticketSectionIdx) => {
            const sectionIdToFind = ticketSection.ticket_section_id;
            const sectionLastIndex = getValues("ticket_sections")
              .map((sectionItem) => sectionItem.ticket_section_id)
              .lastIndexOf(sectionIdToFind);

            return (
              <Flex direction="column" key={ticketSection.id}>
                <TicketFormSection
                  category={`${category}`}
                  ticketSection={ticketSection}
                  ticketSectionIdx={ticketSectionIdx}
                  isEdit={isEdit}
                  requestItemOptionMethods={{
                    onItemNameChange: handleItemNameChange,
                    onItemDescriptionChange: handleItemDescriptionChange,
                  }}
                  onRemoveSection={() =>
                    handleRemoveSection(
                      ticketSection.field_section_duplicatable_id ?? ""
                    )
                  }
                />
                {ticketSection.ticket_section_is_duplicatable &&
                  ticketSectionIdx === sectionLastIndex && (
                    <Button
                      mt="md"
                      variant="light"
                      onClick={() =>
                        handleDuplicateSection(ticketSection.ticket_section_id)
                      }
                      fullWidth
                    >
                      {ticketSection.ticket_section_name} +
                    </Button>
                  )}
              </Flex>
            );
          })}
          <Button type="submit" mt="lg" fullWidth>
            {isEdit ? "Save Changes" : "Submit"}
          </Button>
        </form>
      </FormProvider>
    </>
  );
};

export default TicketRequestItemOptionForm;
