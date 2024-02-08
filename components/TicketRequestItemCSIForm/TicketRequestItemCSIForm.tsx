import { checkCSICodeItemExists, getCSICode, getItem } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { CreateTicketFormValues } from "@/utils/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import TicketFormSection from "../CreateTicketPage/TicketFormSection";

type Props = {
  category: string;
  ticketForm: CreateTicketFormValues | null;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const TicketRequestItemCSIForm = ({
  category,
  ticketForm,
  setIsLoading,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  //   const router = useRouter();
  const activeTeam = useActiveTeam();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, getValues, control, setError } =
    createTicketFormMethods;

  const {
    fields: ticketSections,
    replace: replaceSection,
    remove: removeSection,
    insert: insertSection,
  } = useFieldArray({
    control,
    name: "ticket_sections",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);

      // check if csi exists
      const itemName =
        data.ticket_sections[0].ticket_section_fields[0].ticket_field_response;
      const csiCode =
        data.ticket_sections[0].ticket_section_fields[2].ticket_field_response;
      const divisionId = `${csiCode}`.split(" ")[0];
      const csiExists = await checkIfCSIExists(`${divisionId}`, `${itemName}`);
      if (csiExists) return;

      console.log(category);
      console.log(data);

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });
      //   router.push(
      //     `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
      //       ticket.ticket_id
      //     }`
      //   );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfCSIExists = async (divisionId: string, itemName: string) => {
    const item = await getItem(supabaseClient, {
      itemName,
      teamId: activeTeam.team_id,
    });
    if (!item) return;
    const csiCodeItemExists = await checkCSICodeItemExists(supabaseClient, {
      divisionId,
      itemId: item.item_id,
    });

    if (csiCodeItemExists)
      setError(
        `ticket_sections.0.ticket_section_fields.1.ticket_field_response`,
        { message: `CSI Code already exists for ${itemName}` }
      );

    return csiCodeItemExists;
  };

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`ticket_sections.${index}`);

    if (value) {
      const csiCode = await getCSICode(supabaseClient, { csiCode: value });

      const generalField = [
        ...newSection.ticket_section_fields.slice(0, 2),
        {
          ...newSection.ticket_section_fields[2],
          ticket_field_response: csiCode?.csi_code_section,
        },
        {
          ...newSection.ticket_section_fields[3],
          ticket_field_response: csiCode?.csi_code_division_description,
        },
        {
          ...newSection.ticket_section_fields[4],
          ticket_field_response:
            csiCode?.csi_code_level_two_major_group_description,
        },
        {
          ...newSection.ticket_section_fields[5],
          ticket_field_response:
            csiCode?.csi_code_level_two_minor_group_description,
        },
      ];

      removeSection(index);
      insertSection(index, {
        ...newSection,
        ticket_section_fields: generalField,
      });
    } else {
      const generalField = [
        ...newSection.ticket_section_fields.slice(0, 2),
        ...newSection.ticket_section_fields.slice(2, 6).map((field) => {
          return {
            ...field,
            ticket_field_response: "",
          };
        }),
      ];
      removeSection(index);
      insertSection(index, {
        ...newSection,
        ticket_section_fields: generalField,
      });
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
        <form onSubmit={handleSubmit(handleCreateTicket)}>
          {ticketSections.map((ticketSection, ticketSectionIdx) => (
            <>
              <TicketFormSection
                category={category}
                ticketSection={ticketSection}
                ticketSectionIdx={ticketSectionIdx}
                requestItemCSIMethods={{
                  onCSICodeChange: handleCSICodeChange,
                }}
              />
            </>
          ))}
          <Button type="submit" mt="lg" fullWidth>
            Submit
          </Button>
        </form>
      </FormProvider>
    </>
  );
};

export default TicketRequestItemCSIForm;
